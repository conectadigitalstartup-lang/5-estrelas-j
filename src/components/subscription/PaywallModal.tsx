import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import { useSubscription, PLANS } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName?: string;
}

const PaywallModal = ({ open, onOpenChange, featureName }: PaywallModalProps) => {
  const { createCheckout } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      await createCheckout(PLANS.basico.priceId);
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
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <AlertDialogTitle className="text-2xl font-bold">
            Seu teste grátis acabou!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-muted-foreground mt-2">
            {featureName 
              ? `Para continuar usando ${featureName}, assine o plano profissional.`
              : "Para reativar seu QR Code e continuar recebendo feedbacks, assine um plano."
            }
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="bg-muted/50 rounded-lg p-4 text-center my-4">
          <p className="text-lg font-semibold text-foreground">
            Plano Profissional
          </p>
          <p className="text-3xl font-bold text-foreground mt-1">
            R$99<span className="text-base font-normal text-muted-foreground">/mês</span>
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Cancele quando quiser
          </p>
        </div>

        <AlertDialogFooter className="mt-4 sm:flex-col sm:space-x-0 gap-2">
          <Button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-lg shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Redirecionando...
              </>
            ) : (
              "Assinar Agora"
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              onOpenChange(false);
              navigate("/dashboard/upgrade");
            }}
            className="w-full text-muted-foreground"
          >
            Ver detalhes do plano
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PaywallModal;
