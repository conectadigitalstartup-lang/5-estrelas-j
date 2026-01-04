import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Building2, Loader2, ExternalLink, Clock, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubscription, PLANS } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";

const plans = [
  {
    id: "basico" as const,
    name: "Básico",
    price: "Em Breve",
    period: "",
    description: "Para quem está começando",
    icon: Clock,
    available: false,
    popular: false,
    features: [
      { text: "QR Code Dinâmico", included: true },
      { text: "Dashboard de Métricas", included: true },
      { text: "Notificações por E-mail", included: true },
    ],
  },
  {
    id: "profissional" as const,
    name: "Profissional",
    price: `R$ ${PLANS.profissional.price}`,
    period: "/mês",
    description: "Tudo que você precisa",
    icon: Zap,
    priceId: PLANS.profissional.priceId,
    available: true,
    popular: true,
    features: [
      { text: "1 Restaurante por assinatura", included: true },
      { text: "Canal de Feedback Interno Centralizado", included: true },
      { text: "Convite para Avaliação Pública no Google", included: true },
      { text: "Dashboard de Métricas em Tempo Real", included: true },
      { text: "Assistente de IA para Respostas", included: true },
      { text: "Gerador de Posts para Instagram", included: true },
      { text: "QR Code Dinâmico", included: true },
      { text: "Notificações por E-mail", included: true },
      { text: "Suporte Prioritário via WhatsApp", included: true },
    ],
  },
  {
    id: "agencia" as const,
    name: "Agência",
    price: "Fale Conosco",
    period: "",
    description: "Para múltiplos negócios",
    icon: Building2,
    available: false,
    popular: false,
    features: [
      { text: "Múltiplos Restaurantes", included: true },
      { text: "Relatórios Consolidados", included: true },
      { text: "Gerenciamento de Equipe", included: true },
      { text: "API de Integração", included: true },
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
    if (!subscribed) return false;
    // Check if user has any active subscription
    return planId === "profissional" && subscribed;
  };

  return (
    <>
      <Helmet>
        <title>Upgrade - Avalia Pro</title>
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
                Plano Profissional Ativo
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
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const isCurrent = isPlanCurrent(plan.id);
              const isUnavailable = !plan.available;
              
              return (
                <Card
                  key={plan.name}
                  className={cn(
                    "relative transition-all duration-300",
                    isUnavailable && "opacity-60",
                    !isUnavailable && "hover:shadow-elevated",
                    plan.popular && !isUnavailable && "border-secondary border-2 shadow-lg md:scale-105 z-10",
                    isCurrent && "ring-2 ring-success"
                  )}
                >
                  {isUnavailable && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                      <Badge className="bg-muted text-muted-foreground border border-border">
                        <Clock className="w-3 h-3 mr-1" />
                        Em Breve
                      </Badge>
                    </div>
                  )}
                  {plan.popular && !isUnavailable && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground z-20">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Mais Popular
                    </Badge>
                  )}
                  {isCurrent && (
                    <Badge className="absolute -top-3 right-4 bg-success text-white z-20">
                      Seu Plano
                    </Badge>
                  )}
                  <CardHeader className="text-center pb-2 mt-4">
                    <div className={cn(
                      "w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center",
                      plan.popular ? "bg-secondary/10" : "bg-muted"
                    )}>
                      <plan.icon className={cn(
                        "w-6 h-6",
                        plan.popular ? "text-secondary" : "text-muted-foreground"
                      )} />
                    </div>
                    <CardTitle className={isUnavailable ? "text-muted-foreground" : ""}>
                      {plan.name}
                    </CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="mb-6">
                      <span className={cn(
                        "text-3xl font-bold",
                        isUnavailable ? "text-muted-foreground" : "text-foreground"
                      )}>
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-muted-foreground">{plan.period}</span>
                      )}
                      {plan.popular && (
                        <p className="text-muted-foreground text-sm mt-1 italic">
                          *Cancele quando quiser
                        </p>
                      )}
                    </div>

                    <ul className="space-y-2 text-left mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className={cn(
                            "w-4 h-4 flex-shrink-0",
                            isUnavailable ? "text-muted-foreground/50" : "text-emerald-500"
                          )} />
                          <span className={cn(
                            "text-sm",
                            isUnavailable ? "text-muted-foreground/70" : "text-foreground"
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
                      <Button variant="outline" disabled className="w-full opacity-50">
                        Disponível em Breve
                      </Button>
                    ) : (
                      <Button 
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                        size="lg"
                        onClick={() => handleUpgrade(plan.priceId!, plan.name)}
                      >
                        {subscribed ? "Mudar para este plano" : "Assinar Agora"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <p className="text-center text-muted-foreground text-sm mt-8">
          Pagamento seguro via Stripe. Cancele quando quiser.
        </p>
      </DashboardLayout>
    </>
  );
};

export default DashboardUpgrade;
