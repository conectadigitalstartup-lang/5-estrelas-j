import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Shield, ArrowRight } from "lucide-react";

const features = [
  "QR Code exclusivo para seu restaurante",
  "Material de mesa profissional (PDF para impressão)",
  "Filtro inteligente de feedbacks",
  "Redirecionamento para Google Reviews",
  "Dashboard completo em tempo real",
  "Alertas de feedbacks negativos",
  "Gerador de Posts para Redes Sociais",
  "Suporte por e-mail",
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
            Quanto Custa Proteger Sua Reputação?
          </h2>
          <p className="text-muted-foreground text-lg">
            Menos do que uma única refeição no seu restaurante.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-card border-2 border-secondary rounded-2xl p-8 relative shadow-elevated">
            {/* Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-secondary text-secondary-foreground text-sm font-semibold px-4 py-2 rounded-full">
                Teste grátis por 7 dias
              </span>
            </div>

            <div className="text-center mt-4 mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Plano Profissional
              </h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold text-foreground">R$ 99</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              size="lg"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-lg py-6"
              asChild
            >
              <Link to="/cadastro">
                Começar Meu Teste Grátis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>

            <p className="text-center text-muted-foreground text-sm mt-4">
              Você só paga depois de 7 dias. Cancele a qualquer momento.
            </p>

            {/* Security badges */}
            <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-border">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Shield className="w-4 h-4" />
                <span>Pagamento seguro</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
