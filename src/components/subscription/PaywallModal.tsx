import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, X, Loader2 } from "lucide-react";
import { useSubscription, PLANS } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName?: string;
}

const PaywallModal = ({ open, onOpenChange, featureName }: PaywallModalProps) => {
  const { createCheckoutWithTrial } = useSubscription();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartTrial = async () => {
    setIsLoading(true);
    try {
      await createCheckoutWithTrial(PLANS.basico.priceId);
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o checkout. Tente novamente.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </button>
        
        <AlertDialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <AlertDialogTitle className="text-2xl font-bold">
            🎉 Seu restaurante está quase pronto!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-muted-foreground mt-2">
            {featureName 
              ? `Para ${featureName}, inicie seu teste grátis.`
              : "Para ativar seu QR Code e começar a receber feedbacks filtrados, inicie seu teste grátis."
            }
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4 space-y-3">
          {[
            "7 dias grátis para testar",
            "Cancele quando quiser",
            "Cobrança automática apenas após o teste",
          ].map((benefit, index) => (
            <div key={index} className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span className="text-foreground">{benefit}</span>
            </div>
          ))}
        </div>

        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-sm text-muted-foreground">
            Plano Básico: <span className="font-semibold text-foreground">R$99/mês</span> após o teste
          </p>
        </div>

        <AlertDialogFooter className="mt-4 sm:flex-col sm:space-x-0 gap-2">
          <Button
            onClick={handleStartTrial}
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-lg shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Redirecionando...
              </>
            ) : (
              "Iniciar Teste Grátis de 7 Dias"
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full text-muted-foreground"
          >
            Talvez depois
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PaywallModal;
