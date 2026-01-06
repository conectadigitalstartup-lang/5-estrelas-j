import { useState, useEffect } from "react";
import { Sparkles, Copy, Smile, Briefcase, TrendingUp, Loader2, Star, Check, Pencil, RotateCcw, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
  company?: {
    name: string;
    restaurant_type?: string | null;
    current_google_rating?: number | null;
    current_google_ratings_total?: number | null;
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

const ReplySuggestionsModal = ({ open, onOpenChange, feedback, company }: ReplySuggestionsModalProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [originalSuggestions, setOriginalSuggestions] = useState<Suggestions | null>(null);
  const [editedSuggestions, setEditedSuggestions] = useState<Suggestions | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);

  // Sync editedSuggestions when suggestions change
  useEffect(() => {
    if (suggestions) {
      setEditedSuggestions({ ...suggestions });
      setOriginalSuggestions({ ...suggestions });
    }
  }, [suggestions]);

  // Trigger generation when modal opens
  useEffect(() => {
    if (open && !loading && !suggestions && !error) {
      console.log("Modal opened, triggering generation...");
      generateSuggestions();
    }
    // Reset when modal closes
    if (!open) {
      setSuggestions(null);
      setEditedSuggestions(null);
      setOriginalSuggestions(null);
      setError(null);
      setLimitReached(false);
      setEditingKey(null);
    }
  }, [open]);

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
    setLimitReached(false);
    setSuggestions(null);
    setEditedSuggestions(null);
    setOriginalSuggestions(null);
    setEditingKey(null);

    console.log("Calling generate-reply-suggestions with:", { text: feedback.comment, rating: feedback.rating, company });

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-reply-suggestions", {
        body: {
          text: feedback.comment,
          rating: feedback.rating,
          company: company ? {
            name: company.name,
            restaurant_type: company.restaurant_type,
            current_google_rating: company.current_google_rating,
            current_google_ratings_total: company.current_google_ratings_total,
          } : undefined,
        },
      });

      console.log("Response from edge function:", { data, fnError });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error) {
        if (data?.limitReached) {
          setLimitReached(true);
        }
        throw new Error(data.error);
      }

      if (data?.suggestions) {
        setSuggestions(data.suggestions);
      } else {
        throw new Error("Resposta inválida da IA");
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

  const handleEditChange = (key: keyof Suggestions, value: string) => {
    if (editedSuggestions) {
      setEditedSuggestions({ ...editedSuggestions, [key]: value });
    }
  };

  const handleResetSuggestion = (key: keyof Suggestions) => {
    if (editedSuggestions && originalSuggestions) {
      setEditedSuggestions({ ...editedSuggestions, [key]: originalSuggestions[key] });
    }
  };

  const isEdited = (key: keyof Suggestions) => {
    return editedSuggestions && originalSuggestions && editedSuggestions[key] !== originalSuggestions[key];
  };

  const suggestionCards = [
    {
      key: "amigavel" as const,
      title: "Sugestão Amigável",
      icon: Smile,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      key: "profissional" as const,
      title: "Sugestão Profissional",
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      key: "vendedora" as const,
      title: "Sugestão Vendedora",
      icon: TrendingUp,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            {limitReached ? (
              <>
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-amber-600" />
                </div>
                <p className="text-foreground text-center font-medium">{error}</p>
                <Button 
                  onClick={() => {
                    onOpenChange(false);
                    navigate("/dashboard/upgrade");
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  Ver Planos
                </Button>
              </>
            ) : (
              <>
                <p className="text-destructive text-center">{error}</p>
                <Button onClick={generateSuggestions}>Tentar novamente</Button>
              </>
            )}
          </div>
        )}

        {/* Suggestions */}
        {editedSuggestions && !loading && (
          <div className="space-y-4">
            {suggestionCards.map(({ key, title, icon: Icon, color, bgColor }) => (
              <Card key={key} className="overflow-hidden">
                <CardHeader className={cn("py-3", bgColor)}>
                  <CardTitle className={cn("text-base flex items-center justify-between", color)}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {title}
                      {isEdited(key) && (
                        <span className="text-xs font-normal bg-primary/10 text-primary px-2 py-0.5 rounded">
                          editado
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn("h-7 px-2", color)}
                      onClick={() => setEditingKey(editingKey === key ? null : key)}
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1" />
                      {editingKey === key ? "Fechar" : "Editar"}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {editingKey === key ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editedSuggestions[key]}
                        onChange={(e) => handleEditChange(key, e.target.value)}
                        className="min-h-[100px] resize-none"
                        placeholder="Digite sua resposta personalizada..."
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(editedSuggestions[key], key)}
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
                        {isEdited(key) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResetSuggestion(key)}
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Restaurar original
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-foreground mb-4 whitespace-pre-wrap">
                        {editedSuggestions[key]}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(editedSuggestions[key], key)}
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
                    </>
                  )}
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
