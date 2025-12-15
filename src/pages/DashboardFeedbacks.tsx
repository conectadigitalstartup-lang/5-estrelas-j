import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageSquare, Star, Eye, Filter, QrCode } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface Feedback {
  id: string;
  created_at: string;
  rating: number;
  comment: string | null;
}

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "w-4 h-4",
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
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("all");

  useEffect(() => {
    const fetchFeedbacks = async () => {
      if (!user) return;

      const { data: company } = await supabase
        .from("companies")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (!company) return;

      const { data } = await supabase
        .from("feedbacks")
        .select("*")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false });

      if (data) {
        setFeedbacks(data);
        setFilteredFeedbacks(data);
      }
    };

    fetchFeedbacks();
  }, [user]);

  // Apply filters
  useEffect(() => {
    let result = [...feedbacks];

    // Rating filter
    if (ratingFilter !== "all") {
      const rating = parseInt(ratingFilter);
      result = result.filter((f) => f.rating === rating);
    }

    // Period filter
    if (periodFilter !== "all") {
      const now = new Date();
      const days = parseInt(periodFilter);
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      result = result.filter((f) => new Date(f.created_at) >= cutoff);
    }

    setFilteredFeedbacks(result);
  }, [feedbacks, ratingFilter, periodFilter]);

  const clearFilters = () => {
    setRatingFilter("all");
    setPeriodFilter("all");
  };

  return (
    <>
      <Helmet>
        <title>Feedbacks - Avalia Aí</title>
        <meta name="description" content="Veja todos os feedbacks recebidos dos seus clientes." />
      </Helmet>

      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
            Todos os Feedbacks
          </h1>
          <p className="text-muted-foreground">
            Veja o que seus clientes estão dizendo sobre você.
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="1">1 estrela</SelectItem>
                  <SelectItem value="2">2 estrelas</SelectItem>
                  <SelectItem value="3">3 estrelas</SelectItem>
                  <SelectItem value="4">4 estrelas</SelectItem>
                  <SelectItem value="5">5 estrelas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo o período</SelectItem>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="ghost" onClick={clearFilters}>
                Limpar filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feedbacks Table */}
        <Card className="shadow-card">
          <CardContent className="p-0">
            {filteredFeedbacks.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <MessageSquare className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhum feedback recebido ainda
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Comece a coletar feedbacks compartilhando seu QR Code com os clientes.
                </p>
                <Button asChild className="bg-coral hover:bg-coral-dark">
                  <Link to="/dashboard/qr-code">
                    <QrCode className="w-4 h-4 mr-2" />
                    Ver meu QR Code
                  </Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Avaliação</TableHead>
                    <TableHead className="hidden md:table-cell">Comentário</TableHead>
                    <TableHead className="w-20">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFeedbacks.map((feedback) => (
                    <TableRow
                      key={feedback.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedFeedback(feedback)}
                    >
                      <TableCell className="font-medium">
                        {format(new Date(feedback.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StarRating rating={feedback.rating} />
                          {feedback.rating < 4 && (
                            <Badge variant="outline" className="text-coral border-coral/30 bg-coral/5">
                              Negativo
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground max-w-md truncate">
                        {feedback.comment || "Sem comentário"}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Feedback Detail Modal */}
        <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Detalhes do Feedback</DialogTitle>
            </DialogHeader>
            {selectedFeedback && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <StarRating rating={selectedFeedback.rating} />
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(selectedFeedback.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-foreground">
                    {selectedFeedback.comment || "O cliente não deixou comentário."}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </>
  );
};

export default DashboardFeedbacks;