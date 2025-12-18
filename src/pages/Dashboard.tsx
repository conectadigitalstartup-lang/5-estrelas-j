import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MetricCard from "@/components/dashboard/MetricCard";
import RecentFeedbacks from "@/components/dashboard/RecentFeedbacks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Smartphone, CheckCircle, MessageSquare, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Feedback {
  id: string;
  created_at: string;
  rating: number;
  comment: string | null;
  is_read: boolean;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    totalScans: 0,
    positiveReviews: 0,
    negativeFeedbacks: 0,
  });

  const getDateFilter = (days: string) => {
    if (days === "all") return null;
    const date = new Date();
    date.setDate(date.getDate() - parseInt(days));
    return date.toISOString();
  };

  const calculateMetrics = useCallback((feedbackData: Feedback[]) => {
    const positive = feedbackData.filter((f) => f.rating >= 4).length;
    const negative = feedbackData.filter((f) => f.rating < 4).length;
    setMetrics({
      totalScans: feedbackData.length,
      positiveReviews: positive,
      negativeFeedbacks: negative,
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);

      // Fetch company
      const { data: company } = await supabase
        .from("companies")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (!company) {
        setLoading(false);
        return;
      }

      setCompanyId(company.id);

      // Build query with date filter
      const dateFilter = getDateFilter(period);
      let query = supabase
        .from("feedbacks")
        .select("*")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false });

      if (dateFilter) {
        query = query.gte("created_at", dateFilter);
      }

      const { data: feedbacksData } = await query;

      if (feedbacksData) {
        setFeedbacks(feedbacksData);
        calculateMetrics(feedbacksData);
      }
      setLoading(false);
    };

    fetchData();
  }, [user, period, calculateMetrics]);

  // Real-time subscription for new feedbacks
  useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel('dashboard-feedbacks')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'feedbacks',
          filter: `company_id=eq.${companyId}`
        },
        (payload) => {
          const newFeedback = payload.new as Feedback;
          
          // Add to feedbacks list
          setFeedbacks(prev => [newFeedback, ...prev]);
          
          // Update metrics
          setMetrics(prev => ({
            totalScans: prev.totalScans + 1,
            positiveReviews: newFeedback.rating >= 4 ? prev.positiveReviews + 1 : prev.positiveReviews,
            negativeFeedbacks: newFeedback.rating < 4 ? prev.negativeFeedbacks + 1 : prev.negativeFeedbacks,
          }));
          
          // Show toast notification
          toast({
            title: "Novo feedback recebido!",
            description: `${newFeedback.rating} estrela${newFeedback.rating > 1 ? 's' : ''}`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId, toast]);

  const handleMarkAsRead = async (feedbackId: string) => {
    await supabase
      .from("feedbacks")
      .update({ is_read: true })
      .eq("id", feedbackId);

    setFeedbacks((prev) =>
      prev.map((f) => (f.id === feedbackId ? { ...f, is_read: true } : f))
    );
  };

  const userName = user?.user_metadata?.restaurant_name || "Restaurante";

  return (
    <>
      <Helmet>
        <title>Dashboard - Avalia Aí</title>
        <meta name="description" content="Gerencie a reputação do seu restaurante e acompanhe suas avaliações." />
      </Helmet>

      <DashboardLayout>
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
            Bem-vindo de volta, {userName}! 👋
          </h1>
          <p className="text-muted-foreground">
            Acompanhe suas métricas e gerencie sua reputação online.
          </p>
        </div>

        {/* Period Filter */}
        <div className="flex justify-end mb-6">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Hoje</SelectItem>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="all">Todo período</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {loading ? (
            <>
              <Skeleton className="h-32 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
            </>
          ) : (
            <>
              <MetricCard
                icon={Smartphone}
                value={metrics.totalScans}
                label="Total de Avaliações"
                sublabel="Clientes avaliados"
                iconColor="text-primary"
              />
              <MetricCard
                icon={CheckCircle}
                value={metrics.positiveReviews}
                label="Direcionados ao Google"
                sublabel="Notas 4 e 5 estrelas"
                iconColor="text-success"
              />
              <MetricCard
                icon={MessageSquare}
                value={metrics.negativeFeedbacks}
                label="Feedbacks Privados"
                sublabel="Notas 1 a 3 estrelas"
                iconColor="text-coral"
              />
            </>
          )}
        </div>

        {/* Recent Feedbacks */}
        <div className="mb-8">
          {loading ? (
            <Skeleton className="h-64 rounded-2xl" />
          ) : (
            <RecentFeedbacks feedbacks={feedbacks} onMarkAsRead={handleMarkAsRead} />
          )}
        </div>

        {/* CTA Section */}
        <Card className="border-dashed border-2 border-coral/30 bg-coral/5">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Pronto para receber mais avaliações?</CardTitle>
            <CardDescription>
              Gere seu QR Code e coloque nas mesas do seu restaurante.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button 
              asChild
              className="bg-coral hover:bg-coral-dark text-white"
            >
              <Link to="/dashboard/qr-code">
                <QrCode className="w-4 h-4 mr-2" />
                Gerar QR Code
              </Link>
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    </>
  );
};

export default Dashboard;