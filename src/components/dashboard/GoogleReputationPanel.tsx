import { Star, TrendingUp, TrendingDown, Minus, Calendar, Users, RefreshCw } from "lucide-react";
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
  onUpdate,
}: GoogleReputationPanelProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

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
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className="w-4 h-4 text-muted-foreground/30" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star key={i} className="w-4 h-4 text-muted-foreground/30" />
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
    if (ratingDiff > 0) return <TrendingUp className="w-5 h-5 text-emerald-500" />;
    if (ratingDiff < 0) return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <Minus className="w-5 h-5 text-muted-foreground" />;
  };

  const getRatingTrendColor = () => {
    if (ratingDiff > 0) return "text-emerald-600";
    if (ratingDiff < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Evolução da Reputação no Google
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isUpdating}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isUpdating ? "animate-spin" : ""}`} />
            {isUpdating ? "Atualizando..." : "Atualizar"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Bloco 1: Ponto de Partida */}
          <div className="p-4 bg-white/60 dark:bg-white/5 rounded-xl border border-blue-100 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Ponto de Partida
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Em {formattedDate}
            </p>
            {initialRating !== null && (
              <div className="mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-foreground">
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
          <div className="p-4 bg-white/60 dark:bg-white/5 rounded-xl border border-blue-100 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Situação Atual
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Atualizado recentemente
            </p>
            {currentRating !== null && (
              <div className="mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-foreground">
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

          {/* Bloco 3: Seu Crescimento */}
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                Seu Crescimento
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Desde o início com o Avalia Pro
            </p>
            
            {/* Novas avaliações */}
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-1">Novas Avaliações no Google</p>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${reviewsDiff >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {reviewsDiff >= 0 ? '+' : ''}{reviewsDiff.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>

            {/* Variação da nota */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Variação da Nota</p>
              <div className="flex items-center gap-2">
                {getRatingTrendIcon()}
                <span className={`text-xl font-bold ${getRatingTrendColor()}`}>
                  {ratingDiff >= 0 ? '+' : ''}{ratingDiff.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
          <p className="text-xs text-muted-foreground">
            💡 Este painel mostra sua evolução real no Google desde que começou a usar o Avalia Pro. 
            Os dados são atualizados automaticamente todos os dias.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleReputationPanel;
