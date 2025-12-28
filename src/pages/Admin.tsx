import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { 
  Building2, 
  CreditCard, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  XCircle,
  ThumbsUp,
  ThumbsDown,
  DollarSign,
  Clock,
  ArrowLeft,
  Percent,
  Headphones
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { SUPER_ADMIN_EMAIL } from "@/config/admin";
import { TestRestaurantsSection } from "@/components/admin/TestRestaurantsSection";

interface Client {
  id: string;
  name: string;
  email: string;
  status: string;
  plan: string;
  created_at: string;
}

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
  clients: Client[];
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge className="bg-success text-success-foreground">Ativo</Badge>;
    case "trialing":
      return <Badge className="bg-amber-500 text-white">Trial</Badge>;
    case "canceled":
      return <Badge variant="destructive">Cancelado</Badge>;
    case "past_due":
      return <Badge variant="outline" className="text-muted-foreground">Inadimplente</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6b7280'];

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Calculate ROI and conversion metrics
  const totalLeads = (stats?.activeSubscriptions ?? 0) + (stats?.trialingSubscriptions ?? 0) + (stats?.canceledSubscriptions ?? 0);
  const conversionRate = totalLeads > 0 
    ? ((stats?.activeSubscriptions ?? 0) / totalLeads * 100).toFixed(1) 
    : "0";
  
  // Subscription distribution data for pie chart
  const subscriptionData = [
    { name: "Ativos (Pagando)", value: stats?.activeSubscriptions ?? 0 },
    { name: "Em Trial", value: stats?.trialingSubscriptions ?? 0 },
    { name: "Cancelados", value: stats?.canceledSubscriptions ?? 0 },
  ].filter(item => item.value > 0);

  // Monthly revenue chart data (simulated based on active subscriptions)
  const revenueChartData = [
    { month: "Set", revenue: (stats?.activeSubscriptions ?? 0) * 99 * 0.6 },
    { month: "Out", revenue: (stats?.activeSubscriptions ?? 0) * 99 * 0.75 },
    { month: "Nov", revenue: (stats?.activeSubscriptions ?? 0) * 99 * 0.9 },
    { month: "Dez", revenue: stats?.mrr ?? 0 },
  ];

  // Feedback distribution for bar chart
  const feedbackChartData = [
    { name: "Positivos", count: stats?.positiveFeedbacks ?? 0, fill: "#10b981" },
    { name: "Negativos", count: stats?.negativeFeedbacks ?? 0, fill: "#ef4444" },
  ];

  return (
    <>
      <Helmet>
        <title>Admin CEO - Avalia Pro</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header with back button */}
          <header className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Painel Administrativo CEO
            </h1>
            <p className="text-muted-foreground mt-1">Visão executiva do Avalia Pro</p>
          </header>

          {/* Quick Actions */}
          <section className="mb-8">
            <div className="flex gap-4">
              <Link to="/admin/suporte">
                <Button variant="outline" className="gap-2">
                  <Headphones className="h-4 w-4" />
                  Tickets de Suporte
                </Button>
              </Link>
            </div>
          </section>

          {/* Section 0: Test Restaurants for CEO */}
          <TestRestaurantsSection />

          {/* Section 1: Key Performance Indicators */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Indicadores Chave (KPIs)</h2>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="shadow-elevated">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total de Empresas
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

              <Card className="shadow-elevated border-success/30 bg-success/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Assinaturas Ativas
                  </CardTitle>
                  <CreditCard className="h-5 w-5 text-success" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-10 w-20" />
                  ) : (
                    <>
                      <p className="text-3xl font-bold text-success">
                        {stats?.activeSubscriptions ?? 0}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Pagando mensalmente
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-elevated border-amber-500/30 bg-amber-500/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Em Trial (7 dias)
                  </CardTitle>
                  <Clock className="h-5 w-5 text-amber-500" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-10 w-20" />
                  ) : (
                    <>
                      <p className="text-3xl font-bold text-amber-500">
                        {stats?.trialingSubscriptions ?? 0}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Período gratuito
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-elevated">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Taxa de Conversão
                  </CardTitle>
                  <Percent className="h-5 w-5 text-coral" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-10 w-20" />
                  ) : (
                    <>
                      <p className="text-3xl font-bold text-coral">
                        {conversionRate}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Trial → Pago
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-elevated">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Cancelamentos
                  </CardTitle>
                  <XCircle className="h-5 w-5 text-destructive" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-10 w-20" />
                  ) : (
                    <p className="text-3xl font-bold text-destructive">
                      {stats?.canceledSubscriptions ?? 0}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 2: Revenue & ROI */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Receita & ROI</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="shadow-elevated border-success/30 bg-gradient-to-br from-success/10 to-success/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    MRR (Receita Mensal Recorrente)
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-success" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-12 w-32" />
                  ) : (
                    <>
                      <p className="text-4xl font-bold text-success">
                        {formatCurrency(stats?.mrr ?? 0)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {stats?.activeSubscriptions ?? 0} assinaturas × R$99
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-elevated border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-500/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Receita Potencial (Trial)
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-amber-500" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-12 w-32" />
                  ) : (
                    <>
                      <p className="text-4xl font-bold text-amber-600">
                        {formatCurrency(stats?.potentialRevenue ?? 0)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Se {stats?.trialingSubscriptions ?? 0} trials converterem
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-elevated border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    ARR (Receita Anual Projetada)
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-12 w-32" />
                  ) : (
                    <>
                      <p className="text-4xl font-bold text-primary">
                        {formatCurrency((stats?.mrr ?? 0) * 12)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Projeção anual baseada no MRR
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 3: Charts */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Gráficos & Análises</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card className="shadow-elevated">
                <CardHeader>
                  <CardTitle className="text-base">Evolução do MRR</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={revenueChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis 
                          tickFormatter={(value) => `R$${value}`}
                          className="text-xs"
                        />
                        <Tooltip 
                          formatter={(value: number) => [formatCurrency(value), "Receita"]}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="revenue" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Subscription Distribution Pie Chart */}
              <Card className="shadow-elevated">
                <CardHeader>
                  <CardTitle className="text-base">Distribuição de Assinaturas</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : subscriptionData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={subscriptionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                          labelLine={false}
                        >
                          {subscriptionData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      Nenhuma assinatura ainda
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 4: Usage Metrics */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Métricas de Uso</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="shadow-elevated">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total de Feedbacks
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

              <Card className="shadow-elevated">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Feedbacks Positivos
                  </CardTitle>
                  <ThumbsUp className="h-5 w-5 text-success" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-10 w-20" />
                  ) : (
                    <p className="text-3xl font-bold text-success">
                      {stats?.positiveFeedbacks ?? 0}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-elevated">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Feedbacks Negativos
                  </CardTitle>
                  <ThumbsDown className="h-5 w-5 text-destructive" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-10 w-20" />
                  ) : (
                    <p className="text-3xl font-bold text-destructive">
                      {stats?.negativeFeedbacks ?? 0}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 5: Client List */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Clientes
            </h2>
            <Card className="shadow-elevated">
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-6 space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome da Empresa</TableHead>
                        <TableHead>Responsável</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data de Cadastro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats?.clients && stats.clients.length > 0 ? (
                        stats.clients.map((client) => (
                          <TableRow key={client.id}>
                            <TableCell className="font-medium">{client.name}</TableCell>
                            <TableCell className="text-muted-foreground">{client.email || "-"}</TableCell>
                            <TableCell>{getStatusBadge(client.status)}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {format(new Date(client.created_at), "dd/MM/yyyy", { locale: ptBR })}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            Nenhum cliente cadastrado ainda.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </>
  );
};

export default Admin;
