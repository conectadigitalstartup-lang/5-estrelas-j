import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, X, Shield, ArrowRight, Star } from "lucide-react";

const basicFeatures = [
  { text: "Gestão de Reputação no Google", included: true },
  { text: "QR Code e Material de Mesa", included: true },
  { text: "Gerador de Posts para Instagram", included: true, highlight: true },
  { text: "Secretária Virtual de Respostas (IA)", included: true, highlight: true },
  { text: "Dashboard em Tempo Real", included: true },
  { text: "Alertas de Feedbacks Negativos", included: true },
  { text: "Paparazzi de Comida (Fotos com IA)", included: false },
  { text: "Suporte Prioritário no WhatsApp", included: false },
];

const proFeatures = [
  { text: "Tudo do Plano Básico", included: true, isSummary: true },
  { text: "📸 Paparazzi de Comida (Fotos com IA)", included: true, highlight: true },
  { text: "40 melhorias de fotos por mês", included: true },
  { text: "Suporte Prioritário no WhatsApp", included: true },
];

const PricingSection = () => {
  return (
    <section id="precos" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">
            Investimento
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Escolha o Plano Ideal Para Você
          </h2>
          <p className="text-muted-foreground text-lg">
            Menos do que uma única refeição no seu restaurante. Teste grátis por 7 dias.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Plano Básico */}
          <div className="bg-card border border-border rounded-2xl p-8 relative">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-foreground mb-1">
                Plano Básico
              </h3>
              <p className="text-muted-foreground text-sm">Ideal para começar</p>
            </div>

            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-bold text-foreground">R$ 97</span>
              <span className="text-muted-foreground">/mês</span>
            </div>

            <ul className="space-y-4 mb-8">
              {basicFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  {feature.included ? (
                    <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <X className="w-5 h-5 text-muted-foreground/40 shrink-0 mt-0.5" />
                  )}
                  <span className={`${feature.included ? "text-foreground" : "text-muted-foreground/50"} ${feature.highlight ? "font-medium" : ""}`}>
                    {feature.text}
                    {feature.highlight && feature.included && (
                      <span className="ml-2 text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">
                        Incluso!
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              size="lg"
              variant="outline"
              className="w-full text-lg py-6"
              asChild
            >
              <Link to="/cadastro">
                Testar Grátis por 7 Dias
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>

          {/* Plano Profissional */}
          <div className="bg-card border-2 border-secondary rounded-2xl p-8 relative shadow-elevated">
            {/* Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-secondary text-secondary-foreground text-sm font-semibold px-4 py-2 rounded-full flex items-center gap-1">
                <Star className="w-4 h-4" />
                Recomendado
              </span>
            </div>

            <div className="mb-6 mt-2">
              <h3 className="text-xl font-bold text-foreground mb-1">
                Plano Profissional
              </h3>
              <p className="text-muted-foreground text-sm">Melhor custo-benefício</p>
            </div>

            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-bold text-foreground">R$ 147</span>
              <span className="text-muted-foreground">/mês</span>
            </div>

            <ul className="space-y-4 mb-8">
              {proFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className={`w-5 h-5 shrink-0 mt-0.5 ${feature.isSummary ? "text-secondary" : "text-emerald-500"}`} />
                  <span className={`text-foreground ${feature.highlight ? "font-semibold" : ""} ${feature.isSummary ? "text-secondary" : ""}`}>
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              size="lg"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-lg py-6"
              asChild
            >
              <Link to="/cadastro">
                Testar Grátis por 7 Dias
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>

            <p className="text-center text-muted-foreground text-sm mt-4">
              Você só paga depois de 7 dias
            </p>
          </div>
        </div>

        {/* Security badges */}
        <div className="flex items-center justify-center gap-6 mt-10">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Shield className="w-4 h-4" />
            <span>Pagamento seguro</span>
          </div>
          <div className="text-muted-foreground text-sm">
            Cancele a qualquer momento
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
