import { useState } from "react";
import { AlertCircle, Loader2, CreditCard, Check } from "lucide-react";
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

const features = [
  "Canal de Feedback Interno Centralizado",
  "Convite para Avaliação Pública no Google",
  "Dashboard de Métricas em Tempo Real",
  "Assistente de IA para Respostas",
  "Gerador de Posts para Instagram",
  "QR Code Dinâmico",
  "Suporte Prioritário via WhatsApp",
];

const TrialExpiredModal = ({ isOpen }: TrialExpiredModalProps) => {
  const { createCheckout } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      await createCheckout(PLANS.profissional.priceId);
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast.error("Erro ao iniciar pagamento. Tente novamente.");
    } finally {
      setIsLoading(false);
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
            assine o Plano Profissional.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          {/* Plano Profissional */}
          <div className="border-2 border-secondary rounded-lg p-6 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-secondary text-secondary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                PLANO ÚNICO
              </span>
            </div>
            
            <div className="text-center mb-4 mt-2">
              <h3 className="font-semibold text-xl">Plano Profissional</h3>
              <div className="mt-2">
                <span className="text-4xl font-bold">R$ {PLANS.profissional.price}</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <p className="text-muted-foreground text-sm mt-1 italic">
                *Cancele quando quiser
              </p>
            </div>

            <ul className="space-y-2 mb-6">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button 
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
              size="lg"
              onClick={handleSubscribe}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              Assinar Agora
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
