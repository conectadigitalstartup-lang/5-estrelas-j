import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import OnboardingProgress from "@/components/onboarding/OnboardingProgress";
import StepOne from "@/components/onboarding/StepOne";
import StepTwo from "@/components/onboarding/StepTwo";
import StepThree from "@/components/onboarding/StepThree";
import SuccessScreen from "@/components/onboarding/SuccessScreen";
import { Loader2 } from "lucide-react";

interface FormData {
  name: string;
  type: string;
  description: string;
  logoUrl: string | null;
  googleLink: string;
}

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with single
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  
  const [formData, setFormData] = useState<FormData>(() => {
    const saved = localStorage.getItem("onboarding_data");
    return saved ? JSON.parse(saved) : {
      name: "",
      type: "",
      description: "",
      logoUrl: null,
      googleLink: "",
    };
  });

  // Persist form data to localStorage
  useEffect(() => {
    localStorage.setItem("onboarding_data", JSON.stringify(formData));
  }, [formData]);

  // Check if onboarding is already completed
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setCheckingStatus(false);
        return;
      }

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profile?.onboarding_completed) {
          navigate("/dashboard", { replace: true });
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      } finally {
        setCheckingStatus(false);
      }
    };

    if (!authLoading) {
      checkOnboardingStatus();
    }
  }, [user, authLoading, navigate]);

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleComplete = async () => {
    if (!user) {
      toast.error("Você precisa estar logado");
      return;
    }

    setIsSubmitting(true);

    try {
      // ANTI-FRAUDE: Verificar se o link do Google já existe
      if (formData.googleLink) {
        const { data: linkCheck, error: linkError } = await supabase
          .rpc('check_google_link_exists', { google_link: formData.googleLink });

        if (linkError) {
          console.error("Error checking google link:", linkError);
        } else if (linkCheck && linkCheck.length > 0 && linkCheck[0].exists_flag) {
          const maskedEmail = linkCheck[0].masked_email || '***@***';
          toast.error(
            `Este restaurante já está cadastrado e vinculado ao e-mail ${maskedEmail}. Contate o suporte.`,
            { duration: 8000 }
          );
          setIsSubmitting(false);
          return;
        }
      }

      // Generate unique slug
      let slug = generateSlug(formData.name);
      let slugExists = true;
      let slugSuffix = 0;

      while (slugExists) {
        const finalSlug = slugSuffix > 0 ? `${slug}-${slugSuffix}` : slug;
        const { data: existing } = await supabase
          .from("companies")
          .select("id")
          .eq("slug", finalSlug)
          .maybeSingle();

        if (!existing) {
          slug = finalSlug;
          slugExists = false;
        } else {
          slugSuffix++;
        }
      }

      // Create company
      const { error: companyError } = await supabase.from("companies").insert({
        owner_id: user.id,
        name: formData.name,
        restaurant_type: formData.type,
        description: formData.description || null,
        logo_url: formData.logoUrl,
        google_review_link: formData.googleLink || null,
        slug,
      });

      if (companyError) {
        // Handle unique constraint violation
        if (companyError.code === '23505' && companyError.message.includes('google_review_link')) {
          toast.error(
            "Este restaurante já está cadastrado. Contate o suporte se você é o dono.",
            { duration: 8000 }
          );
          setIsSubmitting(false);
          return;
        }
        throw companyError;
      }

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      // Clear localStorage
      localStorage.removeItem("onboarding_data");

      // Show success screen
      setShowSuccess(true);
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Erro ao salvar dados. Tente novamente.");
      setIsSubmitting(false);
    }
  };

  const handleSuccessComplete = () => {
    navigate("/dashboard", { replace: true });
  };

  if (authLoading || checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted">
        <Loader2 className="w-8 h-8 animate-spin text-coral" />
      </div>
    );
  }

  if (!user) {
    navigate("/auth", { replace: true });
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Configuração Inicial | Avalia Pro</title>
        <meta
          name="description"
          content="Configure seu restaurante no Avalia Pro"
        />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
        <div className="w-full max-w-lg bg-card rounded-2xl shadow-lg p-8">
          {showSuccess ? (
            <SuccessScreen onComplete={handleSuccessComplete} />
          ) : (
            <>
              <div className="text-center mb-4">
                <h1 className="text-2xl font-bold text-navy">Avalia Pro</h1>
              </div>

              <OnboardingProgress currentStep={currentStep} totalSteps={3} />

              {currentStep === 1 && (
                <StepOne
                  data={{
                    name: formData.name,
                    type: formData.type,
                    description: formData.description,
                  }}
                  onChange={(data) => updateFormData(data)}
                  onNext={() => setCurrentStep(2)}
                />
              )}

              {currentStep === 2 && (
                <StepTwo
                  logoUrl={formData.logoUrl}
                  onChange={(logoUrl) => updateFormData({ logoUrl })}
                  onNext={() => setCurrentStep(3)}
                  onBack={() => setCurrentStep(1)}
                />
              )}

              {currentStep === 3 && (
                <StepThree
                  googleLink={formData.googleLink}
                  onChange={(googleLink) => updateFormData({ googleLink })}
                  onComplete={handleComplete}
                  onBack={() => setCurrentStep(2)}
                  isSubmitting={isSubmitting}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Onboarding;
