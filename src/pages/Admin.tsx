import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Navigate } from "react-router-dom";
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
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

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
              Painel Administrativo - Avalia Pro
            </h1>
            <p className="text-muted-foreground mt-1">Visão geral do seu SaaS</p>
          </header>

          {/* Section 1: Main Metrics */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Métricas Principais</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <Skeleton className="h-10 w-20" />
                  ) : (
                    <p className="text-4xl font-bold text-success">
                      {stats?.activeSubscriptions ?? 0}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-elevated">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Em Trial
                  </CardTitle>
                  <Clock className="h-5 w-5 text-amber-500" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-10 w-20" />
                  ) : (
                    <p className="text-4xl font-bold text-amber-500">
                      {stats?.trialingSubscriptions ?? 0}
                    </p>
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
                    <p className="text-4xl font-bold text-destructive">
                      {stats?.canceledSubscriptions ?? 0}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 2: Usage Metrics */}
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
                    <p className="text-4xl font-bold text-foreground">
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
                    <p className="text-4xl font-bold text-success">
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
                    <p className="text-4xl font-bold text-destructive">
                      {stats?.negativeFeedbacks ?? 0}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 3: Revenue */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Receita</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="shadow-elevated border-success/30 bg-success/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    MRR Estimado
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-success" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-10 w-32" />
                  ) : (
                    <p className="text-4xl font-bold text-success">
                      {formatCurrency(stats?.mrr ?? 0)}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Baseado em {stats?.activeSubscriptions ?? 0} assinaturas ativas × R$99
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-elevated border-amber-500/30 bg-amber-500/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Receita Potencial (Trial)
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-amber-500" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-10 w-32" />
                  ) : (
                    <p className="text-4xl font-bold text-amber-600">
                      {formatCurrency(stats?.potentialRevenue ?? 0)}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Se {stats?.trialingSubscriptions ?? 0} trials converterem
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 4: Client List */}
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
