import { useState } from "react";
import { Sparkles, Copy, Smile, Briefcase, TrendingUp, Loader2, Star, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface ReplySuggestionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedback: {
    comment: string | null;
    rating: number;
  };
}

interface Suggestions {
  amigavel: string;
  profissional: string;
  vendedora: string;
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

const ReplySuggestionsModal = ({ open, onOpenChange, feedback }: ReplySuggestionsModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const generateSuggestions = async () => {
    if (!feedback.comment) {
      toast({
        title: "Feedback sem comentário",
        description: "Não é possível gerar sugestões para feedbacks sem texto.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);
    setSuggestions(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-reply-suggestions", {
        body: {
          text: feedback.comment,
          rating: feedback.rating,
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.suggestions) {
        setSuggestions(data.suggestions);
      }
    } catch (err) {
      console.error("Error generating suggestions:", err);
      setError(err instanceof Error ? err.message : "Erro ao gerar sugestões");
      toast({
        title: "Erro ao gerar sugestões",
        description: err instanceof Error ? err.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast({
        title: "Resposta copiada!",
        description: "Agora é só colar no Google.",
      });
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast({
        title: "Erro ao copiar",
        description: "Tente selecionar e copiar manualmente.",
        variant: "destructive",
      });
    }
  };

  // Trigger generation when modal opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && !suggestions && !loading) {
      generateSuggestions();
    }
    if (!isOpen) {
      setSuggestions(null);
      setError(null);
    }
    onOpenChange(isOpen);
  };

  const suggestionCards = [
    {
      key: "amigavel",
      title: "Sugestão Amigável",
      icon: Smile,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      key: "profissional",
      title: "Sugestão Profissional",
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      key: "vendedora",
      title: "Sugestão Vendedora",
      icon: TrendingUp,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Sugestões da Secretária Virtual ✨
          </DialogTitle>
        </DialogHeader>

        {/* Original Feedback */}
        <div className="bg-muted/50 rounded-lg p-4 border">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-muted-foreground">Feedback do cliente:</span>
            <StarRating rating={feedback.rating} />
          </div>
          <p className="text-foreground italic">"{feedback.comment || "Sem comentário"}"</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground text-center">
              Nossa IA está escrevendo as melhores respostas para você...
              <br />
              <span className="text-sm">Aguarde um instante.</span>
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <p className="text-destructive text-center">{error}</p>
            <Button onClick={generateSuggestions}>Tentar novamente</Button>
          </div>
        )}

        {/* Suggestions */}
        {suggestions && !loading && (
          <div className="space-y-4">
            {suggestionCards.map(({ key, title, icon: Icon, color, bgColor }) => (
              <Card key={key} className="overflow-hidden">
                <CardHeader className={cn("py-3", bgColor)}>
                  <CardTitle className={cn("text-base flex items-center gap-2", color)}>
                    <Icon className="w-4 h-4" />
                    {title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-foreground mb-4 whitespace-pre-wrap">
                    {suggestions[key]}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(suggestions[key], key)}
                    className="w-full sm:w-auto"
                  >
                    {copiedKey === key ? (
                      <>
                        <Check className="w-4 h-4 mr-2 text-green-600" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar Texto
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReplySuggestionsModal;
