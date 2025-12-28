import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MetricCard from "@/components/dashboard/MetricCard";
import RecentFeedbacks from "@/components/dashboard/RecentFeedbacks";
import GoogleReputationCard from "@/components/dashboard/GoogleReputationCard";
import GrowthChart from "@/components/dashboard/GrowthChart";
import MonthlyKPIs from "@/components/dashboard/MonthlyKPIs";
import MonthlyComparisonChart from "@/components/dashboard/MonthlyComparisonChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Smartphone, CheckCircle, MessageSquare, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PerformanceData {
  date: string;
  average_rating: number;
  trend?: number | null;
}

interface MonthlyComparison {
  month: string;
  average_rating: number;
  total_feedbacks: number;
}

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
  const [companyName, setCompanyName] = useState<string>("Restaurante");
  const [googleRating, setGoogleRating] = useState<number | null>(null);
  const [googleUserRatingsTotal, setGoogleUserRatingsTotal] = useState<number | null>(null);
  const [metrics, setMetrics] = useState({
    totalScans: 0,
    positiveReviews: 0,
    negativeFeedbacks: 0,
  });
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [monthlyComparison, setMonthlyComparison] = useState<MonthlyComparison[]>([]);
  const [monthlyKPIs, setMonthlyKPIs] = useState({ positive: 0, negative: 0 });
  const [loadingPerformance, setLoadingPerformance] = useState(true);

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

      // Fetch company with Google rating data
      const { data: company } = await supabase
        .from("companies")
        .select("id, name, google_rating, google_user_ratings_total")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (!company) {
        setLoading(false);
        return;
      }

      setCompanyId(company.id);
      setCompanyName(company.name);
      setGoogleRating(company.google_rating);
      setGoogleUserRatingsTotal(company.google_user_ratings_total);

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

  // Fetch performance data
  useEffect(() => {
    const fetchPerformanceData = async () => {
      if (!companyId) {
        setLoadingPerformance(false);
        return;
      }
      setLoadingPerformance(true);

      try {
        const { data, error } = await supabase.functions.invoke("get-performance-data", {
          body: { company_id: companyId },
        });

        if (error) {
          console.error("Erro ao buscar dados de performance:", error);
        } else if (data) {
          setPerformanceData(data.performance_data || []);
          setMonthlyComparison(data.monthly_comparison || []);
          setMonthlyKPIs({
            positive: data.kpis?.positive_this_month || 0,
            negative: data.kpis?.negative_this_month || 0,
          });
        }
      } catch (err) {
        console.error("Erro ao buscar dados de performance:", err);
      } finally {
        setLoadingPerformance(false);
      }
    };

    fetchPerformanceData();
  }, [companyId]);

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

  return (
    <>
      <Helmet>
        <title>Dashboard - Avalia Pro</title>
        <meta name="description" content="Gerencie a reputação do seu restaurante e acompanhe suas avaliações." />
      </Helmet>

      <DashboardLayout>
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
            Bem-vindo de volta, {companyName}! 👋
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

        {/* Google Reputation Card */}
        {!loading && (googleRating !== null || googleUserRatingsTotal !== null) && (
          <div className="mb-8">
            <GoogleReputationCard rating={googleRating} totalRatings={googleUserRatingsTotal} />
          </div>
        )}

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

        {/* Monthly KPIs and Growth Chart */}
        <div className="mb-8 space-y-6">
          {loadingPerformance ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
              </div>
              <Skeleton className="h-72 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
            </>
          ) : (
            <>
              <MonthlyKPIs 
                positiveCount={monthlyKPIs.positive} 
                negativeCount={monthlyKPIs.negative} 
              />
              <GrowthChart data={performanceData} />
              <MonthlyComparisonChart data={monthlyComparison} />
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