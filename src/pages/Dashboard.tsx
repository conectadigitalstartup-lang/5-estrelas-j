import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MetricCard from "@/components/dashboard/MetricCard";
import RecentFeedbacks from "@/components/dashboard/RecentFeedbacks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, CheckCircle, MessageSquare, QrCode } from "lucide-react";

interface Feedback {
  id: string;
  created_at: string;
  rating: number;
  comment: string | null;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [metrics, setMetrics] = useState({
    totalScans: 0,
    positiveReviews: 0,
    negativeFeedbacks: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch company
      const { data: company } = await supabase
        .from("companies")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (!company) return;

      // Fetch all feedbacks
      const { data: feedbacksData } = await supabase
        .from("feedbacks")
        .select("*")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false });

      if (feedbacksData) {
        setFeedbacks(feedbacksData);
        
        const positive = feedbacksData.filter((f) => f.rating >= 4).length;
        const negative = feedbacksData.filter((f) => f.rating < 4).length;

        setMetrics({
          totalScans: feedbacksData.length,
          positiveReviews: positive,
          negativeFeedbacks: negative,
        });
      }
    };

    fetchData();
  }, [user]);

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

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            icon={Smartphone}
            value={metrics.totalScans}
            label="Total de Scans"
            sublabel="Clientes avaliados"
            iconColor="text-primary"
          />
          <MetricCard
            icon={CheckCircle}
            value={metrics.positiveReviews}
            label="Experiências Positivas"
            sublabel="Avaliações 4-5 estrelas"
            iconColor="text-success"
          />
          <MetricCard
            icon={MessageSquare}
            value={metrics.negativeFeedbacks}
            label="Feedbacks Privados"
            sublabel="Comentários para melhorar"
            iconColor="text-coral"
          />
        </div>

        {/* Recent Feedbacks */}
        <div className="mb-8">
          <RecentFeedbacks feedbacks={feedbacks} />
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