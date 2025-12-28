import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20 bg-navy relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Headline */}
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            Sua Reputação Não Pode Esperar
          </h2>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto mb-10">
            Enquanto você lê isso, clientes estão pesquisando restaurantes no Google. O que eles vão encontrar sobre o seu?
          </p>

          {/* CTA Button */}
          <Button
            size="lg"
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-lg px-10 py-7 shadow-lg"
            asChild
          >
            <Link to="/cadastro">
              Proteger Meu Restaurante Agora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
