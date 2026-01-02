import { Helmet } from "react-helmet-async";
import { AlertTriangle, CreditCard, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { useState } from "react";
import avaliaProShield from "@/assets/avalia-pro-shield.jpg";

const AssinaturaPendente = () => {
  const { openCustomerPortal } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdatePayment = async () => {
    setIsLoading(true);
    try {
      await openCustomerPortal();
    } catch (error) {
      console.error("Error opening customer portal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Assinatura Pendente - Avalia Pro</title>
        <meta name="description" content="Sua assinatura precisa de atenção para continuar usando o Avalia Pro." />
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-[#0f172a] flex items-center justify-center">
              <img 
                src={avaliaProShield} 
                alt="Avalia Pro" 
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Card */}
          <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-elevated">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="h-10 w-10 text-amber-600" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-foreground mb-3">
              Ops! Sua assinatura precisa de atenção.
            </h1>

            {/* Description */}
            <p className="text-muted-foreground mb-8">
              Para continuar aproveitando o Avalia Pro e protegendo a reputação do seu restaurante, 
              por favor, atualize seus dados de pagamento.
            </p>

            {/* Primary CTA */}
            <Button 
              size="lg" 
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white mb-4"
              onClick={handleUpdatePayment}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <CreditCard className="h-5 w-5 mr-2" />
              )}
              Atualizar Pagamento
            </Button>

            {/* Secondary Link */}
            <a 
              href="https://wa.me/5511999999999?text=Olá! Preciso de ajuda com minha assinatura do Avalia Pro."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <MessageCircle className="h-4 w-4" />
              Precisa de ajuda? Fale conosco no WhatsApp
            </a>
          </div>

          {/* Footer info */}
          <p className="text-center text-muted-foreground text-xs mt-6">
            Seu QR Code e dados estão seguros. Assim que o pagamento for regularizado, 
            seu acesso será restaurado automaticamente.
          </p>
        </div>
      </div>
    </>
  );
};

export default AssinaturaPendente;
