import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Building2, 
  Mail, 
  Calendar,
  CreditCard,
  MessageSquare,
  Star,
  Lock,
  Unlock,
  KeyRound,
  Trash2,
  Loader2,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserDetail {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  plan: string;
  created_at: string;
  is_blocked: boolean;
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
  companies: {
    id: string;
    name: string;
    slug: string;
    feedbacks_count: number;
    average_rating: number;
  }[];
}

const AdminUserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUserDetail();
  }, [userId]);

  const fetchUserDetail = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("admin-user-detail", {
        body: { userId }
      });
      if (error) throw error;
      setUser(data);
    } catch (error) {
      console.error("Error fetching user detail:", error);
      toast.error("Erro ao carregar detalhes do usuário");
      navigate("/admin/users");
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      const { error } = await supabase.functions.invoke("admin-operations", {
        body: { 
          action: user.is_blocked ? "unblock" : "block", 
          userId: user.user_id 
        }
      });
      if (error) throw error;
      
      toast.success(user.is_blocked ? "Usuário desbloqueado" : "Usuário bloqueado");
      fetchUserDetail();
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error("Erro ao alterar status do usuário");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/atualizar-senha`,
      });
      if (error) throw error;
      toast.success("Email de recuperação enviado");
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Erro ao enviar email de recuperação");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      const { error } = await supabase.functions.invoke("admin-operations", {
        body: { action: "delete", userId: user.user_id }
      });
      if (error) throw error;
      
      toast.success("Usuário deletado com sucesso");
      navigate("/admin/users");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Erro ao deletar usuário");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string, isBlocked: boolean) => {
    if (isBlocked) {
      return <Badge variant="destructive">Bloqueado</Badge>;
    }
    switch (status) {
      case "active":
        return <Badge className="bg-success text-success-foreground">Ativo</Badge>;
      case "trialing":
        return <Badge className="bg-amber-500 text-white">Trial</Badge>;
      case "canceled":
        return <Badge variant="outline" className="text-muted-foreground">Cancelado</Badge>;
      case "past_due":
        return <Badge variant="destructive">Inadimplente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Detalhes do Cliente - Admin | Avalia Pro</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/users")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-display font-bold text-foreground">
              {loading ? <Skeleton className="h-9 w-48" /> : user?.name || "Cliente"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {loading ? <Skeleton className="h-5 w-32" /> : user?.email}
            </p>
          </div>
          {!loading && user && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleBlockUser}
                disabled={actionLoading}
              >
                {user.is_blocked ? (
                  <>
                    <Unlock className="h-4 w-4 mr-2" />
                    Desbloquear
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Bloquear
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleResetPassword}
                disabled={actionLoading}
              >
                <KeyRound className="h-4 w-4 mr-2" />
                Resetar Senha
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={actionLoading}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Deletar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Deletar Usuário</AlertDialogTitle>
                    <AlertDialogDescription>
                      <strong className="text-destructive">Atenção!</strong> Esta ação é irreversível.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteUser}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Deletar Permanentemente
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid gap-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : user ? (
          <>
            {/* User Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Informações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="mt-1">{getStatusBadge(user.status, user.is_blocked)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Plano</p>
                    <p className="font-medium capitalize">{user.plan || "Básico"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{user.phone || "-"}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Datas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Cadastro</p>
                    <p className="font-medium">
                      {format(new Date(user.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  {user.trial_ends_at && (
                    <div>
                      <p className="text-sm text-muted-foreground">Fim do Trial</p>
                      <p className="font-medium">
                        {format(new Date(user.trial_ends_at), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Stripe Customer ID</p>
                    <p className="font-mono text-sm">{user.stripe_customer_id || "-"}</p>
                  </div>
                  {user.stripe_customer_id && (
                    <Button variant="outline" size="sm" asChild>
                      <a 
                        href={`https://dashboard.stripe.com/customers/${user.stripe_customer_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver no Stripe
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Restaurants */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Restaurantes ({user.companies.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.companies.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum restaurante cadastrado
                  </p>
                ) : (
                  <div className="grid gap-4">
                    {user.companies.map((company) => (
                      <div
                        key={company.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card"
                      >
                        <div>
                          <p className="font-medium">{company.name}</p>
                          <p className="text-sm text-muted-foreground">/{company.slug}</p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-2xl font-bold">{company.feedbacks_count}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              Feedbacks
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold flex items-center gap-1">
                              {company.average_rating.toFixed(1)}
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                            </p>
                            <p className="text-xs text-muted-foreground">Média</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Usuário não encontrado</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUserDetail;
