import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Navigate } from "react-router-dom";
import { Building2, CreditCard, MessageSquare } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { SUPER_ADMIN_EMAIL } from "@/config/admin";

interface AdminStats {
  totalCompanies: number;
  activeSubscriptions: number;
  totalFeedbacks: number;
}

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin =
    !!user?.email && user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

  useEffect(() => {
    const fetchStats = async () => {
      if (!isSuperAdmin) return;

      setLoading(true);
      const { data, error } = await supabase.functions.invoke("admin-stats");

      if (error) {
        toast({
          title: "Erro ao carregar admin",
          description: "Não foi possível carregar as métricas.",
          variant: "destructive",
        });
        setStats(null);
        setLoading(false);
        return;
      }

      setStats(data as AdminStats);
      setLoading(false);
    };

    if (!authLoading) {
      if (isSuperAdmin) fetchStats();
      else setLoading(false);
    }
  }, [authLoading, isSuperAdmin, toast]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || !isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <Helmet>
        <title>Admin - Avalia Aí</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-3xl font-display font-bold text-foreground">
              Painel Administrativo
            </h1>
            <p className="text-muted-foreground mt-1">Visão geral do sistema</p>
          </header>

          <main className="grid md:grid-cols-3 gap-6">
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
                    {stats?.totalCompanies ?? 0}
                  </p>
                )}
              </CardContent>
            </Card>

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
                    {stats?.activeSubscriptions ?? 0}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-elevated">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Feedbacks Recebidos
                </CardTitle>
                <MessageSquare className="h-5 w-5 text-coral" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-10 w-24" />
                ) : (
                  <p className="text-4xl font-bold text-foreground">
                    {stats?.totalFeedbacks ?? 0}
                  </p>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </>
  );
};

export default Admin;
