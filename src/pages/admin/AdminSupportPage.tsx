import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { 
  ArrowLeft, 
  Send, 
  MessageSquare, 
  CheckCircle,
  Clock,
  User,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { z } from "zod";

interface Ticket {
  id: string;
  user_id: string;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_email?: string;
}

interface Reply {
  id: string;
  message: string;
  is_admin_reply: boolean;
  created_at: string;
  user_id: string;
}

const replySchema = z.object({
  message: z.string().min(5, "A resposta deve ter pelo menos 5 caracteres").max(2000, "A resposta deve ter no máximo 2000 caracteres"),
});

const AdminSupportPage = () => {
  const { user } = useAuth();
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      fetchReplies(selectedTicket.id);
    }
  }, [selectedTicket]);

  const fetchTickets = async () => {
    try {
      const { data: ticketsData, error: ticketsError } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (ticketsError) throw ticketsError;

      const userIds = [...new Set(ticketsData?.map(t => t.user_id) || [])];
      
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("user_id, restaurant_name")
          .in("user_id", userIds);

        const ticketsWithEmail = ticketsData?.map(ticket => {
          const profile = profilesData?.find(p => p.user_id === ticket.user_id);
          return {
            ...ticket,
            user_email: profile?.restaurant_name || "Cliente"
          };
        });

        setTickets(ticketsWithEmail || []);
      } else {
        setTickets(ticketsData || []);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("Erro ao carregar tickets");
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from("ticket_replies")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setReplies(data || []);
    } catch (error) {
      console.error("Error fetching replies:", error);
      toast.error("Erro ao carregar mensagens");
    }
  };

  const handleSendReply = async () => {
    if (!user || !selectedTicket) return;

    const validation = replySchema.safeParse({ message: replyMessage });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setSubmitting(true);
    try {
      const { error: replyError } = await supabase
        .from("ticket_replies")
        .insert({
          ticket_id: selectedTicket.id,
          user_id: user.id,
          message: replyMessage.trim(),
          is_admin_reply: true,
        });

      if (replyError) throw replyError;

      const { error: updateError } = await supabase
        .from("support_tickets")
        .update({ 
          status: "Respondido pelo Admin",
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedTicket.id);

      if (updateError) throw updateError;

      try {
        await supabase.functions.invoke("send-ticket-notification", {
          body: {
            ticketId: selectedTicket.id,
            ticketSubject: selectedTicket.subject,
            adminMessage: replyMessage.trim(),
            userId: selectedTicket.user_id,
          },
        });
      } catch (notifyError) {
        console.error("Failed to send email notification:", notifyError);
      }

      toast.success("Resposta enviada!");
      setReplyMessage("");
      
      setSelectedTicket({
        ...selectedTicket,
        status: "Respondido pelo Admin"
      });
      
      fetchReplies(selectedTicket.id);
      fetchTickets();
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("Erro ao enviar resposta");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({ 
          status: "Resolvido",
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedTicket.id);

      if (error) throw error;

      toast.success("Ticket fechado com sucesso!");
      
      setSelectedTicket({
        ...selectedTicket,
        status: "Resolvido"
      });
      
      fetchTickets();
    } catch (error) {
      console.error("Error closing ticket:", error);
      toast.error("Erro ao fechar ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "aberto":
        return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">Aberto</Badge>;
      case "respondido pelo admin":
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">Respondido</Badge>;
      case "em andamento":
        return <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30">Em Andamento</Badge>;
      case "resolvido":
        return <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">Resolvido</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusPriority = (status: string) => {
    switch (status.toLowerCase()) {
      case "aberto": return 0;
      case "em andamento": return 1;
      case "respondido pelo admin": return 2;
      case "resolvido": return 3;
      default: return 4;
    }
  };

  const sortedTickets = [...tickets].sort((a, b) => {
    const priorityDiff = getStatusPriority(a.status) - getStatusPriority(b.status);
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (selectedTicket) {
    return (
      <AdminLayout>
        <Helmet>
          <title>Suporte - {selectedTicket.subject} | Admin Avalia Pro</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedTicket(null);
                setReplies([]);
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold text-foreground">
                {selectedTicket.subject}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                {getStatusBadge(selectedTicket.status)}
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {selectedTicket.user_email}
                </span>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(selectedTicket.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
            </div>
            {selectedTicket.status.toLowerCase() !== "resolvido" && (
              <Button
                variant="outline"
                onClick={handleCloseTicket}
                disabled={submitting}
                className="gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Fechar Ticket
              </Button>
            )}
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4 max-h-[500px] overflow-y-auto mb-4">
                {replies.map((reply) => (
                  <div
                    key={reply.id}
                    className={`p-4 rounded-lg ${
                      reply.is_admin_reply
                        ? "bg-primary/10 border border-primary/20 ml-4"
                        : "bg-muted mr-4"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-foreground">
                        {reply.is_admin_reply ? "Você (Admin)" : "Cliente"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(reply.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">{reply.message}</p>
                  </div>
                ))}
                {replies.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma mensagem ainda.
                  </p>
                )}
              </div>

              {selectedTicket.status.toLowerCase() !== "resolvido" && (
                <div className="flex gap-2 border-t pt-4">
                  <Textarea
                    placeholder="Escreva sua resposta como administrador..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="min-h-[100px]"
                    maxLength={2000}
                  />
                  <Button
                    onClick={handleSendReply}
                    disabled={submitting || !replyMessage.trim()}
                    className="self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {selectedTicket.status.toLowerCase() === "resolvido" && (
                <div className="border-t pt-4">
                  <p className="text-center text-muted-foreground flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    Este ticket foi fechado
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>Central de Suporte - Admin | Avalia Pro</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Central de Suporte
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todos os tickets de suporte
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{tickets.filter(t => t.status.toLowerCase() === "aberto").length}</p>
                  <p className="text-xs text-muted-foreground">Abertos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{tickets.filter(t => t.status.toLowerCase() === "respondido pelo admin").length}</p>
                  <p className="text-xs text-muted-foreground">Respondidos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{tickets.filter(t => t.status.toLowerCase() === "resolvido").length}</p>
                  <p className="text-xs text-muted-foreground">Resolvidos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{tickets.length}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tickets Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Todos os Tickets
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : sortedTickets.length === 0 ? (
              <div className="py-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum ticket de suporte ainda.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assunto</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTickets.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <TableCell className="font-medium">{ticket.subject}</TableCell>
                      <TableCell>{ticket.user_email || "Cliente"}</TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell>
                        {format(new Date(ticket.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSupportPage;
