import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Star, ExternalLink, Send, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import confetti from "canvas-confetti";

type Company = {
  id: string;
  name: string;
  logo_url: string | null;
  google_review_link: string | null;
};

type Step = "rating" | "promoter" | "detractor" | "thankyou";

const Avaliar = () => {
  const { slug } = useParams<{ slug: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [step, setStep] = useState<Step>("rating");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!slug) return;

      const { data, error } = await supabase
        .from("companies")
        .select("id, name, logo_url, google_review_link")
        .eq("slug", slug)
        .maybeSingle();

      if (error) {
        console.error("Error fetching company:", error);
        toast.error("Erro ao carregar empresa");
      }

      setCompany(data);
      setLoading(false);
    };

    fetchCompany();
  }, [slug]);

  const handleRatingClick = async (selectedRating: number) => {
    setRating(selectedRating);

    if (selectedRating >= 4) {
      // Promotor - mostrar animação de confete
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#D4AF37", "#1a365d", "#FFD700"],
      });
      setStep("promoter");
    } else {
      // Detrator - mostrar formulário de feedback
      setStep("detractor");
    }
  };

  const handleSubmitFeedback = async () => {
    if (!company) return;

    setSubmitting(true);

    const { error } = await supabase.from("feedbacks").insert({
      company_id: company.id,
      rating,
      comment: comment.trim() || null,
    });

    setSubmitting(false);

    if (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Erro ao enviar feedback");
      return;
    }

    setStep("thankyou");
  };

  const handleGoogleReview = () => {
    if (company?.google_review_link) {
      window.open(company.google_review_link, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Empresa não encontrada
          </h1>
          <p className="text-muted-foreground">
            Verifique o link e tente novamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-xl border border-border/50 p-8 text-center">
          {/* Logo ou Nome */}
          <div className="mb-8">
            {company.logo_url ? (
              <img
                src={company.logo_url}
                alt={company.name}
                className="h-16 mx-auto object-contain"
              />
            ) : (
              <h1 className="text-2xl font-bold text-foreground">
                {company.name}
              </h1>
            )}
          </div>

          {/* Step: Rating */}
          {step === "rating" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground">
                Como foi sua experiência?
              </h2>

              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRatingClick(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform duration-200 hover:scale-110 active:scale-95"
                  >
                    <Star
                      className={`h-12 w-12 transition-colors duration-200 ${
                        star <= (hoveredRating || rating)
                          ? "fill-gold text-gold"
                          : "text-muted-foreground/40"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <p className="text-sm text-muted-foreground">
                Toque em uma estrela para avaliar
              </p>
            </div>
          )}

          {/* Step: Promoter (4-5 stars) */}
          {step === "promoter" && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  🎉 Ficamos muito felizes!
                </h2>
                <p className="text-muted-foreground">
                  Poderia compartilhar sua experiência no Google? Ajuda muito
                  nosso negócio!
                </p>
              </div>

              <div className="flex justify-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-8 w-8 ${
                      star <= rating
                        ? "fill-gold text-gold"
                        : "text-muted-foreground/40"
                    }`}
                  />
                ))}
              </div>

              {company.google_review_link && (
                <Button
                  onClick={handleGoogleReview}
                  size="lg"
                  className="w-full bg-gold hover:bg-gold/90 text-navy font-semibold gap-2"
                >
                  <ExternalLink className="h-5 w-5" />
                  Avaliar no Google
                </Button>
              )}

              <p className="text-xs text-muted-foreground">
                Obrigado por nos ajudar a crescer!
              </p>
            </div>
          )}

          {/* Step: Detractor (1-3 stars) */}
          {step === "detractor" && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">
                  Poxa, o que houve?
                </h2>
                <p className="text-muted-foreground text-sm">
                  Conte para nós o que aconteceu. Esta mensagem é privada e vai
                  direto para a gerência.
                </p>
              </div>

              <div className="flex justify-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 ${
                      star <= rating
                        ? "fill-gold text-gold"
                        : "text-muted-foreground/40"
                    }`}
                  />
                ))}
              </div>

              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Descreva o problema que você teve..."
                className="min-h-[120px] resize-none"
                maxLength={1000}
              />

              <Button
                onClick={handleSubmitFeedback}
                disabled={submitting || !comment.trim()}
                size="lg"
                className="w-full gap-2"
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
                Enviar Feedback para Gerência
              </Button>
            </div>
          )}

          {/* Step: Thank You */}
          {step === "thankyou" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  Obrigado pelo seu feedback!
                </h2>
                <p className="text-muted-foreground">
                  Sua mensagem foi enviada para a gerência. Vamos trabalhar para
                  melhorar!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Powered by Máquina de Reviews
        </p>
      </div>
    </div>
  );
};

export default Avaliar;
