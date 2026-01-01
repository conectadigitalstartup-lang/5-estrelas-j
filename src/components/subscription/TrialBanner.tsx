import { AlertCircle, Clock, Sparkles } from "lucide-react";
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

  const isExpired = status === "inactive" || (status === "trial" && daysLeft <= 0);
  const isUrgent = daysLeft <= 3 && daysLeft > 0;

  // Se está em trial válido, mostrar banner informativo verde/azul
  if (status === "trial" && daysLeft > 0) {
    return (
      <div className="px-4 py-3 flex items-center justify-between gap-4 bg-emerald-500/10 border-b border-emerald-500/20">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-800">
            🎉 Teste grátis ativo! Você tem {daysLeft} {daysLeft === 1 ? "dia" : "dias"} restantes para explorar todas as funcionalidades.
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="border-emerald-500 text-emerald-700 hover:bg-emerald-50"
          onClick={() => navigate("/dashboard/upgrade")}
        >
          Ver planos
        </Button>
      </div>
    );
  }

  // Trial expirado - mostrar banner vermelho
  if (isExpired) {
    return (
      <div className="px-4 py-3 flex items-center justify-between gap-4 bg-destructive/10 border-b border-destructive/20">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <span className="text-sm font-medium text-destructive">
            Seu teste grátis de 7 dias acabou! Para reativar seu QR Code e continuar recebendo feedbacks, escolha um plano.
          </span>
        </div>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => navigate("/dashboard/upgrade")}
        >
          Assinar Agora
        </Button>
      </div>
    );
  }

  return null;
};
