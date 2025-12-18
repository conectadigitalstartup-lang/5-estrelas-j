import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, Star, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { sanitizeInput } from "@/lib/sanitize";

interface Feedback {
  id: string;
  created_at: string;
  rating: number;
  comment: string | null;
  is_read: boolean;
}

interface RecentFeedbacksProps {
  feedbacks: Feedback[];
  onMarkAsRead?: (id: string) => void;
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

const RecentFeedbacks = ({ feedbacks, onMarkAsRead }: RecentFeedbacksProps) => {
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  // Filter only negative feedbacks (rating < 4)
  const negativeFeedbacks = feedbacks.filter((f) => f.rating < 4);
  const unreadCount = negativeFeedbacks.filter((f) => !f.is_read).length;

  const handleOpenFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    if (!feedback.is_read && onMarkAsRead) {
      onMarkAsRead(feedback.id);
    }
  };

  return (
    <>
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-coral" />
            Feedbacks que precisam de atenção
          </CardTitle>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="bg-coral/10 text-coral">
              {unreadCount} novo{unreadCount > 1 ? "s" : ""}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {negativeFeedbacks.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
                <span className="text-3xl">🎉</span>
              </div>
              <p className="text-muted-foreground">
                Nenhum feedback negativo ainda!
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Continue oferecendo um ótimo serviço
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {negativeFeedbacks.slice(0, 5).map((feedback) => (
                <div
                  key={feedback.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer",
                    feedback.is_read ? "bg-muted/30" : "bg-muted/50 border-l-4 border-coral"
                  )}
                  onClick={() => handleOpenFeedback(feedback)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <StarRating rating={feedback.rating} />
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(feedback.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </span>
                      {!feedback.is_read && (
                        <Badge variant="destructive" className="text-xs py-0 px-1.5">
                          Novo
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-foreground truncate">
                      {sanitizeInput(feedback.comment) || "Sem comentário"}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="flex-shrink-0 ml-2">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              {negativeFeedbacks.length > 5 && (
                <Button variant="link" className="w-full text-coral">
                  Ver todos os {negativeFeedbacks.length} feedbacks
                </Button>
              )}
            </div>
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
                  {sanitizeInput(selectedFeedback.comment) || "O cliente não deixou comentário."}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RecentFeedbacks;