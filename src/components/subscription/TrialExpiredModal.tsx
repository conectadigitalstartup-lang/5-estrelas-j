import { useState } from "react";
import { AlertCircle, Loader2, CreditCard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSubscription, PLANS } from "@/hooks/useSubscription";
import { toast } from "sonner";

interface TrialExpiredModalProps {
  isOpen: boolean;
}

const TrialExpiredModal = ({ isOpen }: TrialExpiredModalProps) => {
  const { createCheckout } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (planKey: "basico" | "pro") => {
    setLoadingPlan(planKey);
    try {
      await createCheckout(PLANS[planKey].priceId);
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast.error("Erro ao iniciar pagamento. Tente novamente.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-lg [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            Seu período de teste expirou
          </DialogTitle>
          <DialogDescription className="text-center text-base mt-2">
            Para continuar usando o Avalia Pro e manter seu QR Code ativo, 
            escolha um plano abaixo.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 mt-6">
          {/* Plano Básico */}
          <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">Plano Básico</h3>
                <p className="text-muted-foreground text-sm">Para pequenos negócios</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold">R$ {PLANS.basico.price}</span>
                <span className="text-muted-foreground text-sm">/mês</span>
              </div>
            </div>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => handleSubscribe("basico")}
              disabled={loadingPlan !== null}
            >
              {loadingPlan === "basico" ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              Assinar Básico
            </Button>
          </div>

          {/* Plano Pro */}
          <div className="border-2 border-primary rounded-lg p-4 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                RECOMENDADO
              </span>
            </div>
            <div className="flex items-center justify-between mb-3 mt-2">
              <div>
                <h3 className="font-semibold text-lg">Plano Pro</h3>
                <p className="text-muted-foreground text-sm">Para negócios em crescimento</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold">R$ {PLANS.pro.price}</span>
                <span className="text-muted-foreground text-sm">/mês</span>
              </div>
            </div>
            <Button 
              className="w-full"
              onClick={() => handleSubscribe("pro")}
              disabled={loadingPlan !== null}
            >
              {loadingPlan === "pro" ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              Assinar Pro
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Pagamento seguro via Stripe. Cancele quando quiser.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default TrialExpiredModal;