import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { 
  Building2, 
  CreditCard, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  DollarSign,
  Clock,
  Percent,
  UserPlus,
  UserMinus
} from "lucide-react";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";

interface AdminStats {
  totalCompanies: number;
  activeSubscriptions: number;
  trialingSubscriptions: number;
  canceledSubscriptions: number;
  totalFeedbacks: number;
  positiveFeedbacks: number;
  negativeFeedbacks: number;
  mrr: number;
  potentialRevenue: number;
  recentSignups: { name: string; email: string; date: string }[];
  recentCancellations: { name: string; email: string; date: string }[];
  signupsLast30Days: { date: string; count: number }[];
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("admin-stats-extended");

      if (error) {
        // Fallback to original admin-stats
        const { data: fallbackData, error: fallbackError } = await supabase.functions.invoke("admin-stats");
        if (fallbackError) {
          toast({
            title: "Erro ao carregar admin",
            description: "Não foi possível carregar as métricas.",
            variant: "destructive",
          });
          setStats(null);
        } else {
          setStats({
            ...fallbackData,
            recentSignups: [],
            recentCancellations: [],
            signupsLast30Days: [],
          } as AdminStats);
        }
        setLoading(false);
        return;
      }

      setStats(data as AdminStats);
      setLoading(false);
    };

    fetchStats();
  }, [toast]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const totalLeads = (stats?.activeSubscriptions ?? 0) + (stats?.trialingSubscriptions ?? 0) + (stats?.canceledSubscriptions ?? 0);
  const conversionRate = totalLeads > 0 
    ? ((stats?.activeSubscriptions ?? 0) / totalLeads * 100).toFixed(1) 
    : "0";

  return (
    <AdminLayout>
      <Helmet>
        <title>Admin Dashboard - Avalia Pro</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Visão geral do Avalia Pro</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-elevated">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Clientes Ativos
              </CardTitle>
              <CreditCard className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                <p className="text-3xl font-bold text-foreground">
                  {stats?.activeSubscriptions ?? 0}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-elevated">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Restaurantes
              </CardTitle>
              <Building2 className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                <p className="text-3xl font-bold text-foreground">
                  {stats?.totalCompanies ?? 0}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-elevated">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Feedbacks
              </CardTitle>
              <MessageSquare className="h-5 w-5 text-coral" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                <p className="text-3xl font-bold text-foreground">
                  {stats?.totalFeedbacks ?? 0}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-elevated border-success/30 bg-success/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                MRR
              </CardTitle>
              <DollarSign className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                <p className="text-3xl font-bold text-success">
                  {formatCurrency(stats?.mrr ?? 0)}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.trialingSubscriptions ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Em Trial</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-coral/10">
                  <Percent className="h-5 w-5 text-coral" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{conversionRate}%</p>
                  <p className="text-xs text-muted-foreground">Conversão</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <Users className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.canceledSubscriptions ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Cancelados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency((stats?.mrr ?? 0) * 12)}</p>
                  <p className="text-xs text-muted-foreground">ARR Projetado</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Signups Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Novos Cadastros (30 dias)</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats?.signupsLast30Days || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--coral))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recent Signups */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-success" />
                  Últimos Cadastros
                </h4>
                <div className="space-y-2">
                  {loading ? (
                    <>
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </>
                  ) : stats?.recentSignups && stats.recentSignups.length > 0 ? (
                    stats.recentSignups.slice(0, 5).map((signup, i) => (
                      <div key={i} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium">{signup.name}</p>
                          <p className="text-xs text-muted-foreground">{signup.email}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">{signup.date}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum cadastro recente</p>
                  )}
                </div>
              </div>

              {/* Recent Cancellations */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <UserMinus className="h-4 w-4 text-destructive" />
                  Últimos Cancelamentos
                </h4>
                <div className="space-y-2">
                  {loading ? (
                    <>
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </>
                  ) : stats?.recentCancellations && stats.recentCancellations.length > 0 ? (
                    stats.recentCancellations.slice(0, 5).map((cancel, i) => (
                      <div key={i} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium">{cancel.name}</p>
                          <p className="text-xs text-muted-foreground">{cancel.email}</p>
                        </div>
                        <Badge variant="destructive" className="text-xs">{cancel.date}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum cancelamento recente</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
