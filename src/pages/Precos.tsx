import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Check, Star, Zap, Crown } from "lucide-react";

const plans = [
  {
    name: "Básico",
    icon: Star,
    description: "Ideal para começar a melhorar sua reputação online",
    monthlyPrice: 97,
    yearlyPrice: 77,
    features: [
      "1 restaurante",
      "QR Codes ilimitados",
      "Dashboard básico",
      "Notificações por email",
      "Suporte por email",
      "Relatório mensal",
    ],
    notIncluded: [
      "Personalização completa",
      "Analytics avançado",
      "Múltiplas unidades",
      "Suporte prioritário",
    ],
    popular: false,
    cta: "Começar Teste Grátis",
  },
  {
    name: "Profissional",
    icon: Zap,
    description: "Para restaurantes que querem crescer rapidamente",
    monthlyPrice: 197,
    yearlyPrice: 157,
    features: [
      "Até 3 restaurantes",
      "QR Codes ilimitados",
      "Dashboard completo",
      "Notificações em tempo real",
      "Suporte prioritário",
      "Relatórios semanais",
      "Personalização completa",
      "Analytics avançado",
      "Integração com WhatsApp",
    ],
    notIncluded: ["Restaurantes ilimitados", "Gerente de conta dedicado"],
    popular: true,
    cta: "Começar Teste Grátis",
  },
  {
    name: "Empresarial",
    icon: Crown,
    description: "Para redes e franquias que dominam o mercado",
    monthlyPrice: 397,
    yearlyPrice: 317,
    features: [
      "Restaurantes ilimitados",
      "QR Codes ilimitados",
      "Dashboard completo",
      "Notificações em tempo real",
      "Suporte VIP 24/7",
      "Relatórios diários",
      "Personalização completa",
      "Analytics avançado",
      "Integração com WhatsApp",
      "API completa",
      "Gerente de conta dedicado",
      "Treinamento da equipe",
    ],
    notIncluded: [],
    popular: false,
    cta: "Falar com Vendas",
  },
];

const Precos = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <>
      <Helmet>
        <title>Preços - Máquina de Reviews | Planos para Restaurantes</title>
        <meta
          name="description"
          content="Conheça os planos da Máquina de Reviews. A partir de R$97/mês. Teste grátis por 14 dias. Sem compromisso. Cancele quando quiser."
        />
        <link rel="canonical" href="https://maquinadereviews.com.br/precos" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-32 pb-20">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-secondary font-semibold text-sm uppercase tracking-wider">
                Preços
              </span>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
                Escolha o Plano Ideal para Você
              </h1>
              <p className="text-muted-foreground text-lg">
                Todos os planos incluem 14 dias grátis. Sem cartão de crédito para começar.
                Cancele quando quiser.
              </p>
            </div>

            {/* Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span
                className={`text-sm font-medium transition-colors ${
                  !isYearly ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Mensal
              </span>
              <Switch checked={isYearly} onCheckedChange={setIsYearly} />
              <span
                className={`text-sm font-medium transition-colors ${
                  isYearly ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Anual
              </span>
              {isYearly && (
                <span className="bg-secondary/20 text-secondary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  2 meses grátis
                </span>
              )}
            </div>

            {/* Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`relative bg-card border rounded-2xl p-8 transition-all duration-300 hover:shadow-elevated ${
                    plan.popular
                      ? "border-secondary shadow-gold scale-105 md:scale-110"
                      : "border-border"
                  }`}
                >
                  {/* Popular badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-secondary text-secondary-foreground text-sm font-semibold px-4 py-1 rounded-full">
                        Mais Popular
                      </span>
                    </div>
                  )}

                  {/* Plan header */}
                  <div className="text-center mb-6">
                    <div
                      className={`w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center ${
                        plan.popular ? "bg-secondary" : "bg-primary/10"
                      }`}
                    >
                      <plan.icon
                        className={`w-7 h-7 ${
                          plan.popular ? "text-secondary-foreground" : "text-primary"
                        }`}
                      />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-foreground">
                      {plan.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-8">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-muted-foreground text-lg">R$</span>
                      <span className="font-display text-5xl font-bold text-foreground">
                        {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-muted-foreground">/mês</span>
                    </div>
                    {isYearly && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Cobrado anualmente (R$
                        {plan.yearlyPrice * 12})
                      </p>
                    )}
                  </div>

                  {/* CTA */}
                  <Button
                    className={`w-full mb-8 ${
                      plan.popular
                        ? "bg-secondary text-secondary-foreground hover:bg-gold-dark"
                        : ""
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                    asChild
                  >
                    <Link to="/cadastro">{plan.cta}</Link>
                  </Button>

                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-secondary flex-shrink-0" />
                        <span className="text-foreground text-sm">{feature}</span>
                      </div>
                    ))}
                    {plan.notIncluded.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 opacity-40">
                        <Check className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground text-sm line-through">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* FAQ or Trust */}
            <div className="mt-20 text-center">
              <p className="text-muted-foreground mb-4">
                Ainda com dúvidas? Fale conosco pelo WhatsApp
              </p>
              <Button variant="outline" size="lg">
                Falar com um Especialista
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Precos;
