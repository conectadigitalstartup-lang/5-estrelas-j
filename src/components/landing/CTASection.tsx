import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import ctaBackground from "@/assets/cta-background.mp4";

const CTASection = () => {
  return (
    <section className="py-20 bg-navy relative overflow-hidden">
      {/* Background video */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        >
          <source src={ctaBackground} type="video/mp4" />
        </video>
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-navy/60" />
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
