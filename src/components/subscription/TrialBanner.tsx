import { AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface TrialBannerProps {
  daysLeft: number;
  status: "trial" | "active" | "inactive" | null;
  isSuperAdmin?: boolean;
}

export const TrialBanner = ({ daysLeft, status, isSuperAdmin }: TrialBannerProps) => {
  const navigate = useNavigate();

  // Super admin never sees trial banners
  if (isSuperAdmin || status === "active") return null;

  const isExpired = status === "inactive" || daysLeft <= 0;
  const isUrgent = daysLeft <= 3 && daysLeft > 0;

  return (
    <div
      className={`px-4 py-3 flex items-center justify-between gap-4 ${
        isExpired
          ? "bg-destructive/10 border-b border-destructive/20"
          : isUrgent
          ? "bg-yellow-500/10 border-b border-yellow-500/20"
          : "bg-primary/5 border-b border-primary/10"
      }`}
    >
      <div className="flex items-center gap-3">
        {isExpired ? (
          <AlertCircle className="h-5 w-5 text-destructive" />
        ) : (
          <Clock className="h-5 w-5 text-primary" />
        )}
        <span className="text-sm font-medium">
          {isExpired
            ? "Seu período de teste expirou. Assine um plano para continuar usando."
            : `Seu período de teste termina em ${daysLeft} ${daysLeft === 1 ? "dia" : "dias"}.`}
        </span>
      </div>
      <Button
        size="sm"
        variant={isExpired ? "destructive" : "default"}
        onClick={() => navigate("/dashboard/upgrade")}
      >
        {isExpired ? "Assinar agora" : "Ver planos"}
      </Button>
    </div>
  );
};
