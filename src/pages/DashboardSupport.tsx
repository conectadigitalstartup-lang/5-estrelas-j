import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Plus, MessageSquare, Clock, CheckCircle, Send, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { z } from "zod";

interface Ticket {
  id: string;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Reply {
  id: string;
  message: string;
  is_admin_reply: boolean;
  created_at: string;
}

const ticketSchema = z.object({
  subject: z.string().min(5, "O assunto deve ter pelo menos 5 caracteres").max(200, "O assunto deve ter no máximo 200 caracteres"),
  message: z.string().min(10, "A mensagem deve ter pelo menos 10 caracteres").max(2000, "A mensagem deve ter no máximo 2000 caracteres"),
});

const replySchema = z.object({
  message: z.string().min(5, "A resposta deve ter pelo menos 5 caracteres").max(2000, "A resposta deve ter no máximo 2000 caracteres"),
});

const DashboardSupport = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  useEffect(() => {
    if (selectedTicket) {
      fetchReplies(selectedTicket.id);
    }
  }, [selectedTicket]);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
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

  const handleCreateTicket = async () => {
    if (!user) return;

    const validation = ticketSchema.safeParse({ subject: newSubject, message: newMessage });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setSubmitting(true);
    try {
      // Create ticket
      const { data: ticketData, error: ticketError } = await supabase
        .from("support_tickets")
        .insert({ user_id: user.id, subject: newSubject.trim() })
        .select()
        .single();

      if (ticketError) throw ticketError;

      // Create first reply as the initial message
      const { error: replyError } = await supabase
        .from("ticket_replies")
        .insert({
          ticket_id: ticketData.id,
          user_id: user.id,
          message: newMessage.trim(),
          is_admin_reply: false,
        });

      if (replyError) throw replyError;

      toast.success("Ticket criado com sucesso!");
      setNewSubject("");
      setNewMessage("");
      setShowNewTicket(false);
      fetchTickets();
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error("Erro ao criar ticket");
    } finally {
      setSubmitting(false);
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
      const { error } = await supabase.from("ticket_replies").insert({
        ticket_id: selectedTicket.id,
        user_id: user.id,
        message: replyMessage.trim(),
        is_admin_reply: false,
      });

      if (error) throw error;

      toast.success("Mensagem enviada!");
      setReplyMessage("");
      fetchReplies(selectedTicket.id);
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("Erro ao enviar mensagem");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "aberto":
        return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">Aberto</Badge>;
      case "em andamento":
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">Em Andamento</Badge>;
      case "resolvido":
        return <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">Resolvido</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (selectedTicket) {
    return (
      <DashboardLayout>
        <Helmet>
          <title>Suporte - {selectedTicket.subject} | Avalia Pro</title>
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
                <span className="text-sm text-muted-foreground">
                  Criado em {format(new Date(selectedTicket.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4">
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
                        {reply.is_admin_reply ? "Suporte" : "Você"}
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
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Digite sua resposta..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="min-h-[80px]"
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
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Helmet>
        <title>Suporte | Avalia Pro</title>
        <meta name="description" content="Central de suporte - Abra e acompanhe seus tickets" />
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Suporte
            </h1>
            <p className="text-muted-foreground mt-1">
              Precisa de ajuda? Abra um ticket e nossa equipe irá responder.
            </p>
          </div>
          <Button onClick={() => setShowNewTicket(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Ticket</span>
          </Button>
        </div>

        {showNewTicket && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Novo Ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Assunto
                </label>
                <Input
                  placeholder="Ex: Dúvida sobre QR Code"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  maxLength={200}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Mensagem
                </label>
                <Textarea
                  placeholder="Descreva sua dúvida ou problema em detalhes..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-[120px]"
                  maxLength={2000}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowNewTicket(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateTicket} disabled={submitting}>
                  {submitting ? "Enviando..." : "Criar Ticket"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : tickets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhum ticket ainda
              </h3>
              <p className="text-muted-foreground mb-4">
                Clique em "Novo Ticket" para abrir sua primeira solicitação.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <Card
                key={ticket.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedTicket(ticket)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">
                        {ticket.subject}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(ticket.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(ticket.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardSupport;
