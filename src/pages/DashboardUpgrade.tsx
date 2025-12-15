import { Helmet } from "react-helmet-async";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Zap, Crown, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Básico",
    price: "R$ 99",
    period: "/mês",
    description: "Perfeito para começar",
    icon: Zap,
    current: true,
    features: [
      { text: "Coleta de reviews ilimitada", included: true },
      { text: "Feedback privado", included: true },
      { text: "QR Code personalizado", included: true },
      { text: "Dashboard com métricas", included: true },
      { text: "Notificações por email", included: false },
      { text: "Relatórios avançados", included: false },
    ],
  },
  {
    name: "Pro",
    price: "R$ 199",
    period: "/mês",
    description: "Para crescer",
    icon: Crown,
    popular: true,
    features: [
      { text: "Tudo do plano básico", included: true },
      { text: "Notificações por email", included: true },
      { text: "Respostas automáticas com IA", included: true },
      { text: "Relatórios em PDF", included: true },
      { text: "Integrações com WhatsApp", included: true },
      { text: "White-label", included: false },
    ],
  },
  {
    name: "Enterprise",
    price: "Contato",
    period: "",
    description: "Para escala",
    icon: Building2,
    features: [
      { text: "Tudo do plano pro", included: true },
      { text: "White-label completo", included: true },
      { text: "API personalizada", included: true },
      { text: "Suporte prioritário", included: true },
      { text: "Integrações personalizadas", included: true },
      { text: "Múltiplas unidades", included: true },
    ],
  },
];

const DashboardUpgrade = () => {
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
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "relative transition-all duration-300 hover:shadow-elevated",
                plan.popular && "border-coral shadow-coral/20 scale-105"
              )}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-coral text-white">
                  Popular
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

                {plan.current ? (
                  <Button variant="outline" disabled className="w-full">
                    Plano atual
                  </Button>
                ) : plan.name === "Enterprise" ? (
                  <Button variant="outline" className="w-full">
                    Falar com vendedor
                  </Button>
                ) : (
                  <Button className="w-full bg-coral hover:bg-coral-dark">
                    Fazer upgrade
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardLayout>
    </>
  );
};

export default DashboardUpgrade;