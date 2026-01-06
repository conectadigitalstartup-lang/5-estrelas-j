import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageSquare, Lightbulb, Search, RefreshCw, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface VisitorFeedback {
  id: string;
  created_at: string;
  name: string | null;
  email: string | null;
  feedback_type: string;
  message: string;
}

const AdminVisitorFeedback = () => {
  const [feedbacks, setFeedbacks] = useState<VisitorFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedFeedback, setSelectedFeedback] = useState<VisitorFeedback | null>(null);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-visitor-feedback", {
        body: { action: "list" },
      });

      if (error) throw error;
      setFeedbacks(data?.feedbacks || []);
    } catch (err) {
      console.error("Error fetching visitor feedbacks:", err);
      toast.error("Erro ao carregar feedbacks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este feedback?")) return;

    try {
      const { error } = await supabase.functions.invoke("admin-visitor-feedback", {
        body: { action: "delete", feedbackId: id },
      });

      if (error) throw error;
      
      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
      toast.success("Feedback excluído");
    } catch (err) {
      console.error("Error deleting feedback:", err);
      toast.error("Erro ao excluir feedback");
    }
  };

  const filteredFeedbacks = feedbacks.filter((f) => {
    const matchesSearch =
      f.message.toLowerCase().includes(search.toLowerCase()) ||
      f.name?.toLowerCase().includes(search.toLowerCase()) ||
      f.email?.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = typeFilter === "all" || f.feedback_type === typeFilter;

    return matchesSearch && matchesType;
  });

  const feedbackCount = feedbacks.filter((f) => f.feedback_type === "feedback").length;
  const suggestionCount = feedbacks.filter((f) => f.feedback_type === "sugestao").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Feedbacks de Visitantes</h1>
          <p className="text-muted-foreground">
            Visualize feedbacks e sugestões enviados pelos visitantes do site
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{feedbacks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Feedbacks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{feedbackCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Sugestões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">{suggestionCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por mensagem, nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="feedback">Feedbacks</SelectItem>
              <SelectItem value="sugestao">Sugestões</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchFeedbacks} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="max-w-[300px]">Mensagem</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filteredFeedbacks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum feedback encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFeedbacks.map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(feedback.created_at), "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={feedback.feedback_type === "feedback" ? "default" : "secondary"}
                          className={
                            feedback.feedback_type === "feedback"
                              ? "bg-blue-500/10 text-blue-500"
                              : "bg-amber-500/10 text-amber-500"
                          }
                        >
                          {feedback.feedback_type === "feedback" ? (
                            <><MessageSquare className="h-3 w-3 mr-1" /> Feedback</>
                          ) : (
                            <><Lightbulb className="h-3 w-3 mr-1" /> Sugestão</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>{feedback.name || "-"}</TableCell>
                      <TableCell>{feedback.email || "-"}</TableCell>
                      <TableCell className="max-w-[300px]">
                        <p
                          className="truncate cursor-pointer hover:text-primary"
                          onClick={() => setSelectedFeedback(feedback)}
                        >
                          {feedback.message}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(feedback.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Detail Modal */}
        <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedFeedback?.feedback_type === "feedback" ? (
                  <><MessageSquare className="h-5 w-5 text-blue-500" /> Feedback</>
                ) : (
                  <><Lightbulb className="h-5 w-5 text-amber-500" /> Sugestão</>
                )}
              </DialogTitle>
            </DialogHeader>
            {selectedFeedback && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nome:</span>
                    <p className="font-medium">{selectedFeedback.name || "Não informado"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{selectedFeedback.email || "Não informado"}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Data:</span>
                    <p className="font-medium">
                      {format(new Date(selectedFeedback.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Mensagem:</span>
                  <p className="mt-1 p-3 bg-muted rounded-lg whitespace-pre-wrap">
                    {selectedFeedback.message}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminVisitorFeedback;
