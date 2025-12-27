import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Star, ExternalLink, Send, CheckCircle, Loader2, Copy, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import confetti from "canvas-confetti";

type Company = {
  id: string;
  name: string;
  logo_url: string | null;
  google_review_link: string | null;
  isTestRestaurant?: boolean;
};

type Step = "rating" | "promoter" | "detractor" | "thankyou";

const Avaliar = () => {
  const { slug } = useParams<{ slug: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [step, setStep] = useState<Step>("rating");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [promoterComment, setPromoterComment] = useState("");

  useEffect(() => {
    const fetchCompanyAndCheckAccess = async () => {
      if (!slug) return;

      // First, check if this is a test restaurant (CEO test restaurants always have access)
      const { data: testRestaurant, error: testError } = await supabase
        .from("admin_test_restaurants")
        .select("id, name, google_review_link, slug")
        .eq("slug", slug)
        .maybeSingle();

      if (testRestaurant) {
        // This is a test restaurant - always accessible
        setHasAccess(true);
        setCompany({
          id: testRestaurant.id,
          name: testRestaurant.name,
          logo_url: null,
          google_review_link: testRestaurant.google_review_link,
          isTestRestaurant: true,
        });
        setLoading(false);
        return;
      }

      // Not a test restaurant, check regular company access
      const { data: accessData, error: accessError } = await supabase
        .rpc('check_company_access', { company_slug: slug });

      if (accessError) {
        console.error("Error checking access:", accessError);
        setHasAccess(false);
        setLoading(false);
        return;
      }

      setHasAccess(accessData);

      // If no access, don't bother fetching company details
      if (!accessData) {
        setLoading(false);
        return;
      }

      // Fetch company details
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

    fetchCompanyAndCheckAccess();
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

    // Skip saving feedback for test restaurants (no real company_id)
    if (!company.isTestRestaurant) {
      const { error } = await supabase.from("feedbacks").insert({
        company_id: company.id,
        rating,
        comment: comment.trim() || null,
      });

      if (error) {
        console.error("Error submitting feedback:", error);
        toast.error("Erro ao enviar feedback");
        setSubmitting(false);
        return;
      }
    }

    setSubmitting(false);
    setStep("thankyou");
  };

  const handleGoToGoogle = () => {
    if (!company) return;

    // Save the positive feedback (fire and forget) - skip for test restaurants
    if (!company.isTestRestaurant) {
      supabase.from("feedbacks").insert({
        company_id: company.id,
        rating,
        comment: promoterComment.trim() || null,
      }).then(() => {
        // Fire and forget
      });
    }

    // Copy comment to clipboard if exists (don't await, don't block)
    if (promoterComment.trim()) {
      navigator.clipboard.writeText(promoterComment).then(() => {
        toast.success("✓ Texto copiado! Cole no Google.");
      }).catch((err) => {
        console.error("Failed to copy:", err);
      });
    }
    // Navigation is handled by the native <a> element - no blocking
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Access blocked - subscription invalid
  if (hasAccess === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-xl border border-border/50 p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <h1 className="text-xl font-semibold text-foreground mb-2">
              Serviço Temporariamente Indisponível
            </h1>
            <p className="text-muted-foreground text-sm">
              Este canal de avaliação está temporariamente indisponível.
            </p>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6 opacity-50">
            Avalia Pro
          </p>
        </div>
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
              {/* Progress Bar - Zeigarnik Effect */}
              <div className="bg-muted rounded-lg p-4 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    Passo 1 de 2: Nota registrada
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">2</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Passo 2 de 2: Publicar no Google
                  </span>
                </div>
                {/* Progress bar visual */}
                <div className="mt-3 h-2 bg-muted-foreground/20 rounded-full overflow-hidden">
                  <div className="h-full w-1/2 bg-emerald-500 rounded-full" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  🎉 Que bom que você gostou!
                </h2>
                <p className="text-muted-foreground">
                  Sua opinião ajuda outros clientes a descobrirem este lugar incrível
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

              {/* Optional comment field for promoters */}
              <Textarea
                value={promoterComment}
                onChange={(e) => setPromoterComment(e.target.value)}
                placeholder="Escreva seu elogio aqui (opcional - será copiado automaticamente)"
                className="min-h-[100px] resize-none"
                maxLength={500}
              />

              {company.google_review_link && (
                <a
                  href={company.google_review_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleGoToGoogle}
                  className="w-full inline-flex items-center justify-center gap-2 h-12 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-md transition-colors"
                >
                  <ExternalLink className="h-5 w-5" />
                  Publicar meu elogio
                </a>
              )}

              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Copy className="w-3 h-3" />
                Seu texto será copiado automaticamente para facilitar
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
          Powered by Avalia Pro
        </p>
      </div>
    </div>
  );
};

export default Avaliar;
