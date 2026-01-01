import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { 
  Search, 
  Eye, 
  Lock, 
  Unlock, 
  KeyRound, 
  Trash2,
  UserCog,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface User {
  id: string;
  user_id: string;
  name: string;
  email: string;
  status: string;
  plan: string;
  created_at: string;
  is_blocked: boolean;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("admin-users");
      if (error) throw error;
      setUsers(data?.users || []);
      setFilteredUsers(data?.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId: string, currentlyBlocked: boolean) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase.functions.invoke("admin-operations", {
        body: { 
          action: currentlyBlocked ? "unblock" : "block", 
          userId 
        }
      });
      if (error) throw error;
      
      toast.success(currentlyBlocked ? "Usuário desbloqueado" : "Usuário bloqueado");
      fetchUsers();
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error("Erro ao alterar status do usuário");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPassword = async (email: string) => {
    setActionLoading(email);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/atualizar-senha`,
      });
      if (error) throw error;
      toast.success("Email de recuperação enviado");
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Erro ao enviar email de recuperação");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase.functions.invoke("admin-operations", {
        body: { action: "delete", userId }
      });
      if (error) throw error;
      
      toast.success("Usuário deletado com sucesso");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Erro ao deletar usuário");
    } finally {
      setActionLoading(null);
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

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <AdminLayout>
      <Helmet>
        <title>Gerenciar Clientes - Admin | Avalia Pro</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Gerenciamento de Clientes
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todos os clientes do Avalia Pro
          </p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Clientes ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : paginatedUsers.length === 0 ? (
              <div className="py-12 text-center">
                <UserCog className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum cliente encontrado</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Cadastro</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name || "-"}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{getStatusBadge(user.status, user.is_blocked)}</TableCell>
                        <TableCell>
                          {format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  asChild
                                >
                                  <Link to={`/admin/users/${user.user_id}`}>
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Ver Detalhes</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleBlockUser(user.user_id, user.is_blocked)}
                                  disabled={actionLoading === user.user_id}
                                >
                                  {user.is_blocked ? (
                                    <Unlock className="h-4 w-4 text-success" />
                                  ) : (
                                    <Lock className="h-4 w-4 text-amber-500" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {user.is_blocked ? "Desbloquear" : "Bloquear"}
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleResetPassword(user.email)}
                                  disabled={actionLoading === user.email}
                                >
                                  <KeyRound className="h-4 w-4 text-primary" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Resetar Senha</TooltipContent>
                            </Tooltip>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Deletar Usuário</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    <strong className="text-destructive">Atenção!</strong> Esta ação é irreversível. 
                                    Todos os dados do usuário serão permanentemente deletados, incluindo:
                                    <ul className="list-disc list-inside mt-2">
                                      <li>Restaurantes cadastrados</li>
                                      <li>Feedbacks coletados</li>
                                      <li>Assinatura e histórico</li>
                                    </ul>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUser(user.user_id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Deletar Permanentemente
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Página {currentPage} de {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
