import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Shield, Star, ArrowLeft, CheckCircle } from "lucide-react";
import { useSubscription, PLANS } from "@/hooks/useSubscription";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const CompleteRegistration = () => {
  const { createCheckoutWithTrial } = useSubscription();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleContinueToPayment = async () => {
    setIsLoading(true);
    try {
      await createCheckoutWithTrial(PLANS.basico.priceId);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o checkout. Tente novamente.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Complete seu Cadastro - Avalia Aí</title>
        <meta name="description" content="Complete seu cadastro para começar seu teste grátis de 14 dias." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/50 flex flex-col">
        <header className="p-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao início
          </Link>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-border/50 shadow-xl rounded-2xl">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 rounded-xl bg-coral mx-auto flex items-center justify-center mb-4 shadow-lg">
                <Star className="w-10 h-10 text-white" fill="currentColor" />
              </div>
              <CardTitle className="text-2xl font-semibold text-foreground">
                Complete seu cadastro
              </CardTitle>
              <CardDescription className="text-muted-foreground text-base">
                Para começar seu teste grátis de 14 dias, precisamos dos dados do seu cartão.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">
                      Você só será cobrado após o período de teste
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      Cancele a qualquer momento durante os 14 dias e não será cobrado nada.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-foreground">O que você terá acesso:</h3>
                <ul className="space-y-2">
                  {[
                    "QR Code personalizado para seu restaurante",
                    "Dashboard completo de avaliações",
                    "Filtro inteligente de feedbacks",
                    "Integração com Google Reviews",
                    "Suporte prioritário",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-muted-foreground">Plano Básico</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-foreground">R$99</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                </div>
                <Button 
                  onClick={handleContinueToPayment}
                  className="w-full h-12 bg-coral hover:bg-coral/90 text-white font-semibold"
                  disabled={isLoading}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {isLoading ? "Redirecionando..." : "Continuar para pagamento"}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-3">
                  Pagamento seguro via Stripe. Seus dados estão protegidos.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CompleteRegistration;
