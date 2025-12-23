import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, CheckCircle } from "lucide-react";

const features = [
  "14 dias grátis para testar",
  "Sem cartão de crédito",
  "Cancele quando quiser",
  "Suporte em português",
];

const CTASection = () => {
  return (
    <section className="py-20 bg-navy relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-foreground/10 border border-primary-foreground/20 rounded-full px-4 py-2 mb-8">
            <Star className="w-4 h-4 text-secondary" fill="currentColor" />
            <span className="text-primary-foreground/90 text-sm font-medium">
              Mais de 500 restaurantes já usam
            </span>
          </div>

          {/* Headline */}
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            Pronto para ter o restaurante mais bem avaliado{" "}
            <span className="text-gradient-gold">da sua cidade?</span>
          </h2>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto mb-8">
            Junte-se a centenas de estabelecimentos que já protegem sua reputação com o Avalia Pro.
          </p>

          {/* Features */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-10">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-secondary" />
                <span className="text-primary-foreground/80 text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Button
            size="lg"
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-lg px-10 py-7 shadow-lg"
            asChild
          >
            <Link to="/cadastro">
              Começar Agora - É Grátis por 14 Dias
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>

          <p className="mt-4 text-primary-foreground/50 text-sm">
            Configure em 5 minutos. Veja os resultados na primeira semana.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
