import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Zap, Crown, Building2, Loader2, ExternalLink, Construction } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubscription, PLANS } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";

const plans = [
  {
    id: "basico" as const,
    name: "Profissional",
    price: "R$ 99",
    period: "/mês",
    description: "Tudo que você precisa para dominar sua reputação",
    icon: Zap,
    priceId: PLANS.basico.priceId,
    available: true,
    popular: true,
    features: [
      { text: "1 restaurante", included: true },
      { text: "QR Codes ilimitados", included: true },
      { text: "Dashboard completo", included: true },
      { text: "Filtro de avaliações negativas", included: true },
      { text: "Gerador de posts para redes sociais", included: true },
      { text: "Notificações por email", included: true },
    ],
  },
  {
    id: "enterprise" as const,
    name: "Empresarial",
    price: "R$ 297",
    period: "/mês",
    description: "Para redes e franquias",
    icon: Building2,
    available: false,
    features: [
      { text: "Múltiplos restaurantes", included: true },
      { text: "Tudo do plano Profissional", included: true },
      { text: "API completa", included: true },
      { text: "Gerente de conta dedicado", included: true },
      { text: "Suporte prioritário", included: true },
      { text: "Integrações personalizadas", included: true },
    ],
  },
];

const DashboardUpgrade = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { 
    plan: currentPlan, 
    subscribed, 
    status, 
    isLoading, 
    createCheckout,
    openCustomerPortal,
    checkSubscription 
  } = useSubscription();

  // Handle checkout result from URL params
  useEffect(() => {
    const checkoutResult = searchParams.get("checkout");
    if (checkoutResult === "success") {
      toast({
        title: "Assinatura realizada!",
        description: "Sua assinatura foi processada com sucesso. Obrigado!",
      });
      checkSubscription();
    } else if (checkoutResult === "canceled") {
      toast({
        title: "Checkout cancelado",
        description: "Você pode tentar novamente quando quiser.",
        variant: "destructive",
      });
    }
  }, [searchParams, toast, checkSubscription]);

  const handleUpgrade = async (priceId: string, planName: string) => {
    try {
      toast({
        title: "Redirecionando...",
        description: `Abrindo checkout para o plano ${planName}`,
      });
      await createCheckout(priceId);
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o checkout. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleManageSubscription = async () => {
    try {
      toast({
        title: "Abrindo portal...",
        description: "Redirecionando para o portal de gerenciamento",
      });
      await openCustomerPortal();
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast({
        title: "Erro",
        description: "Não foi possível abrir o portal. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const isPlanCurrent = (planId: string) => {
    if (planId === "enterprise") return false;
    return subscribed && currentPlan === planId;
  };

  return (
    <>
      <Helmet>
        <title>Upgrade - Avalia Aí</title>
        <meta name="description" content="Escolha o plano ideal para o seu negócio." />
      </Helmet>

      <DashboardLayout>
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
            Escolha seu plano
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Potencialize a reputação do seu restaurante com recursos avançados.
          </p>
          
          {status === "trial" && (
            <Badge variant="secondary" className="mt-4 bg-amber-100 text-amber-800">
              Você está no período de teste gratuito
            </Badge>
          )}
          
          {subscribed && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Badge className="bg-success text-white">
                Plano {currentPlan === "pro" ? "Pro" : "Básico"} Ativo
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleManageSubscription}
                className="gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Gerenciar assinatura
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => {
              const isCurrent = isPlanCurrent(plan.id);
              const isUnavailable = !plan.available;
              
              return (
                <Card
                  key={plan.name}
                  className={cn(
                    "relative transition-all duration-300",
                    isUnavailable && "opacity-75",
                    !isUnavailable && "hover:shadow-elevated",
                    plan.popular && !isUnavailable && "border-coral shadow-coral/20 scale-105",
                    isCurrent && "ring-2 ring-success"
                  )}
                >
                  {isUnavailable && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 rounded-lg flex flex-col items-center justify-center">
                      <Construction className="h-12 w-12 text-amber-500 mb-2" />
                      <Badge className="bg-amber-500 text-white">
                        Em breve
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-2 text-center px-4">
                        Este plano está em construção e será liberado em breve!
                      </p>
                    </div>
                  )}
                  {plan.popular && !isUnavailable && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-coral text-white">
                      Popular
                    </Badge>
                  )}
                  {isCurrent && (
                    <Badge className="absolute -top-3 right-4 bg-success text-white">
                      Seu Plano
                    </Badge>
                  )}
                  <CardHeader className="text-center pb-2">
                    <div className={cn(
                      "w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center",
                      plan.popular ? "bg-coral/10" : "bg-muted"
                    )}>
                      <plan.icon className={cn(
                        "w-6 h-6",
                        plan.popular ? "text-coral" : "text-muted-foreground"
                      )} />
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>

                    <ul className="space-y-3 text-left mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                          {feature.included ? (
                            <Check className="w-4 h-4 text-success flex-shrink-0" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                          )}
                          <span className={cn(
                            "text-sm",
                            feature.included ? "text-foreground" : "text-muted-foreground/70"
                          )}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {isCurrent ? (
                      <Button variant="outline" disabled className="w-full">
                        Plano atual
                      </Button>
                    ) : isUnavailable ? (
                      <Button variant="outline" disabled className="w-full">
                        Em construção
                      </Button>
                    ) : plan.id === "enterprise" ? (
                      <Button variant="outline" className="w-full" disabled>
                        Falar com vendedor
                      </Button>
                    ) : (
                      <Button 
                        className="w-full bg-coral hover:bg-coral-dark"
                        onClick={() => handleUpgrade(plan.priceId!, plan.name)}
                      >
                        {subscribed ? "Mudar para este plano" : "Fazer upgrade"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </DashboardLayout>
    </>
  );
};

export default DashboardUpgrade;
