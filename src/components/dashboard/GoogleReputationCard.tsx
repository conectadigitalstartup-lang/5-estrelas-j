import { Star, Users, TrendingUp, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GoogleReputationCardProps {
  rating: number | null;
  totalRatings: number | null;
  placeId: string | null;
  companyId: string | null;
  onUpdate?: (rating: number | null, totalRatings: number | null) => void;
}

const GoogleReputationCard = ({ 
  rating, 
  totalRatings, 
  placeId, 
  companyId,
  onUpdate 
}: GoogleReputationCardProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  // Don't render if no Google data available
  if (rating === null && totalRatings === null) {
    return null;
  }

  const handleRefresh = async () => {
    if (!placeId || !companyId) {
      toast.error("Dados do Google não disponíveis");
      return;
    }

    setIsUpdating(true);

    try {
      // Fetch updated data from Google Places API
      const { data, error } = await supabase.functions.invoke("search-places", {
        body: { place_id: placeId },
      });

      if (error) throw error;

      if (data?.details) {
        const newRating = data.details.rating;
        const newTotal = data.details.user_ratings_total;

        // Update company in database
        const { error: updateError } = await supabase
          .from("companies")
          .update({
            google_rating: newRating,
            google_user_ratings_total: newTotal,
          })
          .eq("id", companyId);

        if (updateError) throw updateError;

        // Notify parent component
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

  const getRatingMessage = (rating: number) => {
    if (rating >= 4.5) return "Excelente! Continue assim!";
    if (rating >= 4.0) return "Muito bom! Pequenas melhorias podem ajudar.";
    if (rating >= 3.5) return "Bom, mas há espaço para melhorar.";
    if (rating >= 3.0) return "Atenção: feedbacks podem revelar pontos críticos.";
    return "Momento de ouvir seus clientes com atenção.";
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Sua Reputação no Google
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
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Rating Section */}
          {rating !== null && (
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Nota Média</p>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-foreground">
                  {rating.toFixed(1)}
                </span>
                <div className="flex items-center gap-0.5">
                  {renderStars(rating)}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {getRatingMessage(rating)}
              </p>
            </div>
          )}

          {/* Total Reviews Section */}
          {totalRatings !== null && (
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Total de Avaliações</p>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-foreground">
                  {totalRatings.toLocaleString('pt-BR')}
                </span>
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Avaliações públicas no Google
              </p>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
          <p className="text-xs text-muted-foreground">
            💡 Compare esses dados com os feedbacks que você recebe pelo Avalia Pro para identificar oportunidades de melhoria.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleReputationCard;
