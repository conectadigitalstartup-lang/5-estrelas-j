import { Star, TrendingUp, TrendingDown, Minus, Calendar, Users, RefreshCw, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GoogleReputationPanelProps {
  initialRating: number | null;
  initialRatingsTotal: number | null;
  currentRating: number | null;
  currentRatingsTotal: number | null;
  createdAt: string | null;
  placeId: string | null;
  companyId: string | null;
  isLoading?: boolean;
  onUpdate?: (currentRating: number | null, currentRatingsTotal: number | null) => void;
}

const GoogleReputationPanel = ({
  initialRating,
  initialRatingsTotal,
  currentRating,
  currentRatingsTotal,
  createdAt,
  placeId,
  companyId,
  isLoading = false,
  onUpdate,
}: GoogleReputationPanelProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-accent/10 border-2 border-primary/20 shadow-xl">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <div className="text-center">
              <p className="text-lg font-medium text-foreground">Analisando sua reputação atual no Google...</p>
              <p className="text-sm text-muted-foreground mt-1">Estamos buscando os dados do seu estabelecimento</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't render if no Google data available
  if (initialRating === null && initialRatingsTotal === null && 
      currentRating === null && currentRatingsTotal === null) {
    return null;
  }

  const handleRefresh = async () => {
    if (!placeId || !companyId) {
      toast.error("Dados do Google não disponíveis");
      return;
    }

    setIsUpdating(true);

    try {
      const { data, error } = await supabase.functions.invoke("search-places", {
        body: { place_id: placeId },
      });

      if (error) throw error;

      if (data?.details) {
        const newRating = data.details.rating;
        const newTotal = data.details.user_ratings_total;

        const { error: updateError } = await supabase
          .from("companies")
          .update({
            current_google_rating: newRating,
            current_google_ratings_total: newTotal,
            google_rating: newRating,
            google_user_ratings_total: newTotal,
          })
          .eq("id", companyId);

        if (updateError) throw updateError;

        onUpdate?.(newRating, newTotal);
        toast.success("Dados do Google atualizados!");
      }
    } catch (err) {
      console.error("Erro ao atualizar dados:", err);
      toast.error("Erro ao atualizar. Tente novamente.");
    } finally {
      setIsUpdating(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className="w-5 h-5 text-muted-foreground/30" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star key={i} className="w-5 h-5 text-muted-foreground/30" />
        );
      }
    }
    return stars;
  };

  // Calculate differences
  const ratingDiff = (currentRating ?? 0) - (initialRating ?? 0);
  const reviewsDiff = (currentRatingsTotal ?? 0) - (initialRatingsTotal ?? 0);

  const formattedDate = createdAt 
    ? format(new Date(createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : "Data não disponível";

  const getRatingTrendIcon = () => {
    if (ratingDiff > 0) return <TrendingUp className="w-6 h-6 text-emerald-500" />;
    if (ratingDiff < 0) return <TrendingDown className="w-6 h-6 text-red-500" />;
    return <Minus className="w-6 h-6 text-muted-foreground" />;
  };

  const getRatingTrendColor = () => {
    if (ratingDiff > 0) return "text-emerald-600";
    if (ratingDiff < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-accent/10 border-2 border-primary/20 shadow-xl overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-primary/20 rounded-xl">
                <TrendingUp className="w-7 h-7 text-primary" />
              </div>
              Evolução da Sua Reputação no Google
            </CardTitle>
            <p className="text-muted-foreground mt-2 ml-14">
              Acompanhe o impacto real do Avalia Pro no seu negócio
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isUpdating}
            className="border-primary/30 hover:bg-primary/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isUpdating ? "animate-spin" : ""}`} />
            {isUpdating ? "Atualizando..." : "Atualizar Agora"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bloco 1: Ponto de Partida */}
          <div className="p-5 bg-background/80 backdrop-blur rounded-2xl border border-border/50 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-base font-bold text-foreground">
                Este é o seu ponto de partida no Google
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Capturamos esta "foto" da sua reputação no momento em que você se cadastrou em {formattedDate}.
            </p>
            {initialRating !== null && (
              <div className="mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-foreground">
                    {initialRating.toFixed(1)}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {renderStars(initialRating)}
                  </div>
                </div>
              </div>
            )}
            {initialRatingsTotal !== null && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{initialRatingsTotal.toLocaleString('pt-BR')} avaliações</span>
              </div>
            )}
          </div>

          {/* Bloco 2: Situação Atual */}
          <div className="p-5 bg-background/80 backdrop-blur rounded-2xl border border-border/50 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-foreground">
                Situação Atual no Google
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Dados atualizados automaticamente todos os dias
            </p>
            {currentRating !== null && (
              <div className="mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-foreground">
                    {currentRating.toFixed(1)}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {renderStars(currentRating)}
                  </div>
                </div>
              </div>
            )}
            {currentRatingsTotal !== null && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{currentRatingsTotal.toLocaleString('pt-BR')} avaliações</span>
              </div>
            )}
          </div>

          {/* Bloco 3: Impacto do Avalia Pro */}
          <div className="p-5 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl border-2 border-emerald-500/30 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                O Impacto do Avalia Pro
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Veja o que conquistamos juntos desde o início
            </p>
            
            {/* Novas avaliações */}
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-1">Novas Avaliações no Google</p>
              <div className="flex items-center gap-2">
                <span className={`text-3xl font-bold ${reviewsDiff >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {reviewsDiff >= 0 ? '+' : ''}{reviewsDiff.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>

            {/* Variação da nota */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Variação da Nota</p>
              <div className="flex items-center gap-2">
                {getRatingTrendIcon()}
                <span className={`text-2xl font-bold ${getRatingTrendColor()}`}>
                  {ratingDiff >= 0 ? '+' : ''}{ratingDiff.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground text-center">
            💡 <strong>Dica:</strong> Quanto mais feedbacks você coletar, mais clientes satisfeitos você direciona para o Google, 
            melhorando sua nota e aumentando sua visibilidade!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleReputationPanel;
