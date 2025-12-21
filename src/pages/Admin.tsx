import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CreditCard, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// SUPER ADMIN EMAIL
const SUPER_ADMIN_EMAIL = "alexandrehugolb@gmail.com";

interface AdminStats {
  totalCompanies: number;
  activeSubscriptions: number;
  totalFeedbacks: number;
}

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

  useEffect(() => {
    const fetchStats = async () => {
      if (!isSuperAdmin) return;

      try {
        // Fetch total companies
        const { count: companiesCount } = await supabase
          .from("companies")
          .select("*", { count: "exact", head: true });

        // Fetch active subscriptions (active or trialing)
        const { count: subscriptionsCount } = await supabase
          .from("subscriptions")
          .select("*", { count: "exact", head: true })
          .in("status", ["active", "trialing"]);

        // Fetch total feedbacks
        const { count: feedbacksCount } = await supabase
          .from("feedbacks")
          .select("*", { count: "exact", head: true });

        setStats({
          totalCompanies: companiesCount || 0,
          activeSubscriptions: subscriptionsCount || 0,
          totalFeedbacks: feedbacksCount || 0,
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && isSuperAdmin) {
      fetchStats();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, isSuperAdmin]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Helmet>
        <title>Admin - Avalia Aí</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-foreground">
              Painel Administrativo
            </h1>
            <p className="text-muted-foreground mt-1">
              Visão geral do sistema
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Total Companies */}
            <Card className="shadow-elevated">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Empresas
                </CardTitle>
                <Building2 className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-10 w-24" />
                ) : (
                  <p className="text-4xl font-bold text-foreground">
                    {stats?.totalCompanies || 0}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Active Subscriptions */}
            <Card className="shadow-elevated">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Assinaturas Ativas
                </CardTitle>
                <CreditCard className="h-5 w-5 text-success" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-10 w-24" />
                ) : (
                  <p className="text-4xl font-bold text-foreground">
                    {stats?.activeSubscriptions || 0}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Total Feedbacks */}
            <Card className="shadow-elevated">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Feedbacks Capturados
                </CardTitle>
                <MessageSquare className="h-5 w-5 text-coral" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-10 w-24" />
                ) : (
                  <p className="text-4xl font-bold text-foreground">
                    {stats?.totalFeedbacks || 0}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Admin;
