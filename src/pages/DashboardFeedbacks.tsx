import { useEffect, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useDebouncedCallback } from "use-debounce";
import {
  MessageSquare,
  Star,
  Eye,
  QrCode,
  Search,
  Download,
  Trash2,
  MoreVertical,
  Check,
  Clock,
  User,
  Mail,
  AlertCircle,
  TrendingUp,
  X,
  ChevronLeft,
  ChevronRight,
  Share2,
  Sparkles,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PaywallButton from "@/components/subscription/PaywallButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { sanitizeInput, escapeCSV } from "@/lib/sanitize";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import PostGeneratorModal from "@/components/feedback/PostGeneratorModal";
import ReplySuggestionsModal from "@/components/feedback/ReplySuggestionsModal";

interface Feedback {
  id: string;
  created_at: string;
  rating: number;
  comment: string | null;
  customer_name: string | null;
  customer_email: string | null;
  is_read: boolean;
  client_name?: string | null;
  client_phone?: string | null;
}

interface Stats {
  total: number;
  unread: number;
  avgRating: number;
  thisMonth: number;
}

const ITEMS_PER_PAGE = 10;

const StarRating = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) => {
  const sizeClass = size === "lg" ? "w-6 h-6" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClass,
            star <= rating
              ? "text-amber-500 fill-amber-500"
              : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
};

const DashboardFeedbacks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyData, setCompanyData] = useState<{ name: string; logo_url: string | null } | null>(null);
  const [postGeneratorFeedback, setPostGeneratorFeedback] = useState<Feedback | null>(null);
  const [replySuggestionsFeedback, setReplySuggestionsFeedback] = useState<Feedback | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search
  const handleSearchChange = useDebouncedCallback((value: string) => {
    setDebouncedSearch(value);
    setCurrentPage(1);
  }, 300);

  // Stats
  const [stats, setStats] = useState<Stats>({
    total: 0,
    unread: 0,
    avgRating: 0,
    thisMonth: 0,
  });

  const hasActiveFilters = debouncedSearch || ratingFilter !== "all" || statusFilter !== "all" || periodFilter !== "all";

  useEffect(() => {
    const fetchFeedbacks = async () => {
      if (!user) return;
      setLoading(true);

      const { data: company } = await supabase
        .from("companies")
        .select("id, name, logo_url")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (!company) {
        setLoading(false);
        return;
      }

      setCompanyId(company.id);
      setCompanyData({ name: company.name, logo_url: company.logo_url });

      const { data } = await supabase
        .from("feedbacks")
        .select("*")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false });

      if (data) {
        setFeedbacks(data);
        calculateStats(data);
      }
      setLoading(false);
    };

    fetchFeedbacks();
  }, [user]);

  const calculateStats = (data: Feedback[]) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const total = data.length;
    const unread = data.filter((f) => !f.is_read).length;
    const avgRating = total > 0 ? data.reduce((sum, f) => sum + f.rating, 0) / total : 0;
    const thisMonth = data.filter((f) => new Date(f.created_at) >= startOfMonth).length;

    setStats({ total, unread, avgRating, thisMonth });
  };

  // Apply filters
  const filteredFeedbacks = feedbacks.filter((feedback) => {
    // Search (using debounced value)
    if (debouncedSearch && !feedback.comment?.toLowerCase().includes(debouncedSearch.toLowerCase())) {
      return false;
    }

    // Rating filter
    if (ratingFilter !== "all" && feedback.rating !== parseInt(ratingFilter)) {
      return false;
    }

    // Status filter
    if (statusFilter === "unread" && feedback.is_read) return false;
    if (statusFilter === "read" && !feedback.is_read) return false;

    // Period filter
    if (periodFilter !== "all") {
      const days = parseInt(periodFilter);
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      if (new Date(feedback.created_at) < cutoff) return false;
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredFeedbacks.length / ITEMS_PER_PAGE);
  const paginatedFeedbacks = filteredFeedbacks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setRatingFilter("all");
    setStatusFilter("all");
    setPeriodFilter("all");
    setCurrentPage(1);
  };

  // Optimistic update for read status
  const toggleReadStatus = async (feedbackId: string, currentStatus: boolean) => {
    // Store previous state for rollback
    const previousFeedbacks = [...feedbacks];
    
    // Optimistic update
    const updatedFeedbacks = feedbacks.map((f) =>
      f.id === feedbackId ? { ...f, is_read: !currentStatus } : f
    );
    setFeedbacks(updatedFeedbacks);
    calculateStats(updatedFeedbacks);

    const { error } = await supabase
      .from("feedbacks")
      .update({ is_read: !currentStatus })
      .eq("id", feedbackId);

    if (error) {
      // Rollback on error
      setFeedbacks(previousFeedbacks);
      calculateStats(previousFeedbacks);
      toast({
        title: "Erro ao atualizar",
        description: "Tente novamente",
        variant: "destructive",
      });
    } else {
      toast({
        title: currentStatus ? "Marcado como não lido" : "Marcado como lido",
      });
    }
  };

  const markAllAsRead = async () => {
    if (!companyId) return;

    // Store previous state for rollback
    const previousFeedbacks = [...feedbacks];
    
    // Optimistic update
    const updatedFeedbacks = feedbacks.map((f) => ({ ...f, is_read: true }));
    setFeedbacks(updatedFeedbacks);
    calculateStats(updatedFeedbacks);

    const { error } = await supabase
      .from("feedbacks")
      .update({ is_read: true })
      .eq("company_id", companyId)
      .eq("is_read", false);

    if (error) {
      // Rollback on error
      setFeedbacks(previousFeedbacks);
      calculateStats(previousFeedbacks);
      toast({
        title: "Erro ao atualizar",
        description: "Tente novamente",
        variant: "destructive",
      });
    } else {
      toast({ title: "Todos os feedbacks marcados como lidos" });
    }
  };

  // Optimistic delete
  const deleteFeedback = async () => {
    if (!deleteId) return;

    // Store previous state for rollback
    const previousFeedbacks = [...feedbacks];
    
    // Optimistic update
    const updatedFeedbacks = feedbacks.filter((f) => f.id !== deleteId);
    setFeedbacks(updatedFeedbacks);
    calculateStats(updatedFeedbacks);

    try {
      const { error } = await supabase
        .from("feedbacks")
        .delete()
        .eq("id", deleteId);

      if (error) {
        // Rollback on error
        setFeedbacks(previousFeedbacks);
        calculateStats(previousFeedbacks);
        console.error("Erro ao deletar feedback:", error);
        toast({
          title: "Erro ao excluir",
          description: error.message || "Verifique suas permissões e tente novamente",
          variant: "destructive",
        });
      } else {
        toast({ title: "Feedback excluído com sucesso" });
      }
    } catch (err) {
      // Rollback on unexpected error
      setFeedbacks(previousFeedbacks);
      calculateStats(previousFeedbacks);
      console.error("Erro inesperado ao deletar:", err);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível excluir o feedback. Tente novamente.",
        variant: "destructive",
      });
    }
    setDeleteId(null);
  };

  const MAX_EXPORT_ROWS = 10000;

  const exportToCSV = () => {
    if (filteredFeedbacks.length === 0) {
      toast({
        title: "Nada para exportar",
        description: "Não há feedbacks para exportar",
      });
      return;
    }

    if (filteredFeedbacks.length > MAX_EXPORT_ROWS) {
      toast({
        title: "Muitos registros",
        description: `Filtre por período para exportar. Máximo: ${MAX_EXPORT_ROWS.toLocaleString()} registros`,
        variant: "destructive",
      });
      return;
    }

    try {
      const headers = ["Data", "Rating", "Comentário", "Nome", "Email", "Status"];
      const rows = filteredFeedbacks.map((f) => [
        format(new Date(f.created_at), "dd/MM/yyyy HH:mm"),
        f.rating.toString(),
        escapeCSV(f.comment),
        escapeCSV(f.customer_name),
        f.customer_email || "",
        f.is_read ? "Lido" : "Não lido",
      ]);

      const BOM = '\uFEFF'; // For special character support
      const csvContent = BOM + [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `feedbacks-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({ title: "CSV exportado com sucesso!" });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const handleOpenFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    if (!feedback.is_read) {
      toggleReadStatus(feedback.id, feedback.is_read);
    }
  };

  return (
    <>
      <Helmet>
        <title>Feedbacks - Avalia Pro</title>
        <meta name="description" content="Veja todos os feedbacks recebidos dos seus clientes." />
      </Helmet>

      <DashboardLayout>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-1">
              Feedbacks Recebidos
            </h1>
            <p className="text-muted-foreground">
              Gerencie os feedbacks privados dos seus clientes
            </p>
          </div>
          <PaywallButton 
            variant="outline" 
            onClick={exportToCSV} 
            disabled={filteredFeedbacks.length === 0}
            featureName="exportar dados"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </PaywallButton>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {loading ? (
            <>
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </>
          ) : (
            <>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-destructive/10 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Não Lidos</p>
                      <p className="text-2xl font-bold text-destructive">{stats.unread}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Star className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rating Médio</p>
                      <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-success/10 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Este Mês</p>
                      <p className="text-2xl font-bold">{stats.thisMonth}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar nos comentários..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      handleSearchChange(e.target.value);
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={ratingFilter} onValueChange={(v) => { setRatingFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="1">⭐ 1 estrela</SelectItem>
                  <SelectItem value="2">⭐⭐ 2 estrelas</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ 3 estrelas</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ 4 estrelas</SelectItem>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ 5 estrelas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="unread">Não lidos</SelectItem>
                  <SelectItem value="read">Lidos</SelectItem>
                </SelectContent>
              </Select>

              <Select value={periodFilter} onValueChange={(v) => { setPeriodFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo período</SelectItem>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Mostrando {filteredFeedbacks.length} de {stats.total} feedbacks
                {stats.unread > 0 && (
                  <span className="ml-2 text-destructive font-medium">
                    • {stats.unread} não lidos
                  </span>
                )}
              </span>
              {stats.unread > 0 && (
                <Button variant="link" size="sm" className="p-0 h-auto" onClick={markAllAsRead}>
                  Marcar todos como lidos
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Feedbacks List */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <Card className="py-16">
            <CardContent className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum feedback encontrado</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                {hasActiveFilters
                  ? "Nenhum feedback encontrado com os filtros selecionados. Tente ajustar os filtros."
                  : "Quando seus clientes enviarem feedbacks privados, eles aparecerão aqui. Compartilhe seu QR Code para começar a receber!"}
              </p>
              {hasActiveFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Limpar Filtros
                </Button>
              ) : (
                <Button asChild className="bg-gold hover:bg-gold-dark text-primary">
                  <Link to="/dashboard/qr-code">
                    <QrCode className="w-4 h-4 mr-2" />
                    Ver Meu QR Code
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {paginatedFeedbacks.map((feedback) => (
              <Card
                key={feedback.id}
                className={cn(
                  "transition-all hover:shadow-md cursor-pointer",
                  !feedback.is_read && "border-l-4 border-l-gold bg-gold/5"
                )}
                onClick={() => handleOpenFeedback(feedback)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <StarRating rating={feedback.rating} />
                        {!feedback.is_read && (
                          <Badge variant="destructive" className="text-xs">
                            Novo
                          </Badge>
                        )}
                      </div>

                      <p className="text-foreground mb-3">
                        {feedback.comment ? (
                          sanitizeInput(feedback.comment)
                        ) : (
                          <span className="text-muted-foreground italic">
                            Nenhum comentário adicionado
                          </span>
                        )}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {feedback.customer_name && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {sanitizeInput(feedback.customer_name)}
                          </div>
                        )}
                        {feedback.customer_email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {feedback.customer_email}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDistanceToNow(new Date(feedback.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {/* Botão Gerar Post visível para feedbacks positivos */}
                      {feedback.rating >= 4 && feedback.comment && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPostGeneratorFeedback(feedback)}
                          className="gap-1.5 border-gold/30 text-gold hover:bg-gold/10 hover:text-gold"
                        >
                          <Share2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Gerar Post</span>
                        </Button>
                      )}

                      {!feedback.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleReadStatus(feedback.id, feedback.is_read)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">Marcar como lido</span>
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenFeedback(feedback)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver detalhes
                          </DropdownMenuItem>
                          {feedback.rating >= 4 && feedback.comment && (
                            <DropdownMenuItem onClick={() => setPostGeneratorFeedback(feedback)}>
                              <Share2 className="w-4 h-4 mr-2" />
                              Gerar Post
                            </DropdownMenuItem>
                          )}
                          {feedback.comment && (
                            <DropdownMenuItem onClick={() => setReplySuggestionsFeedback(feedback)}>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Ver Sugestões de Resposta
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => toggleReadStatus(feedback.id, feedback.is_read)}>
                            <Check className="w-4 h-4 mr-2" />
                            {feedback.is_read ? "Marcar como não lido" : "Marcar como lido"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteId(feedback.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Anterior
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Próximo
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feedback Detail Modal */}
        <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Detalhes do Feedback</DialogTitle>
            </DialogHeader>
            {selectedFeedback && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <StarRating rating={selectedFeedback.rating} size="lg" />
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <p className="text-foreground">
                    {sanitizeInput(selectedFeedback.comment) || "Nenhum comentário"}
                  </p>
                </div>

                <div className="space-y-2">
                  {selectedFeedback.customer_name && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{sanitizeInput(selectedFeedback.customer_name)}</span>
                    </div>
                  )}
                  {selectedFeedback.customer_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a
                        href={`mailto:${selectedFeedback.customer_email}`}
                        className="text-primary hover:underline"
                      >
                        {selectedFeedback.customer_email}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {format(new Date(selectedFeedback.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  {selectedFeedback.customer_email && (
                    <Button asChild className="flex-1">
                      <a href={`mailto:${selectedFeedback.customer_email}`}>
                        <Mail className="w-4 h-4 mr-2" />
                        Responder
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => toggleReadStatus(selectedFeedback.id, selectedFeedback.is_read)}
                  >
                    {selectedFeedback.is_read ? "Marcar não lido" : "Marcar como lido"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir feedback?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. O feedback será removido permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={deleteFeedback} className="bg-destructive hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Post Generator Modal */}
        {postGeneratorFeedback && companyData && (
          <PostGeneratorModal
            open={!!postGeneratorFeedback}
            onOpenChange={(open) => !open && setPostGeneratorFeedback(null)}
            feedback={{
              comment: postGeneratorFeedback.comment,
              rating: postGeneratorFeedback.rating,
              client_name: postGeneratorFeedback.client_name || postGeneratorFeedback.customer_name,
              created_at: postGeneratorFeedback.created_at,
            }}
            company={companyData}
          />
        )}

        {/* Reply Suggestions Modal */}
        {replySuggestionsFeedback && (
          <ReplySuggestionsModal
            open={!!replySuggestionsFeedback}
            onOpenChange={(open) => !open && setReplySuggestionsFeedback(null)}
            feedback={{
              comment: replySuggestionsFeedback.comment,
              rating: replySuggestionsFeedback.rating,
            }}
          />
        )}
      </DashboardLayout>
    </>
  );
};

export default DashboardFeedbacks;