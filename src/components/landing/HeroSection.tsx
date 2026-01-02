import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import heroBackgroundVideo from "@/assets/hero-background.mp4";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-navy">
      {/* Background video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        >
          <source src={heroBackgroundVideo} type="video/mp4" />
        </video>
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-navy/60" />
      </div>

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden z-1">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-gold/5 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6 animate-fade-in">
            Proteja Seu Restaurante de Avaliações Negativas e{" "}
            <span className="text-gradient-gold">Aumente Sua Nota no Google</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-primary-foreground/70 max-w-3xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            O Avalia Pro intercepta feedbacks negativos antes que virem críticas públicas e direciona clientes satisfeitos para avaliarem você no Google. Resultado: sua reputação sobe e seu restaurante enche.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center gap-4 mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Button
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-lg px-10 py-7 shadow-lg"
              asChild
            >
              <Link to="/cadastro">
                Começar Teste Grátis de 7 Dias
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            
            {/* Trust badges below CTA */}
            <p className="text-primary-foreground/60 text-sm">
              Sem compromisso. Cancele quando quiser.
            </p>
          </div>

          {/* Secondary CTA */}
          <div className="animate-fade-in" style={{ animationDelay: "0.25s" }}>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-lg px-8 py-6"
              asChild
            >
              <a href="#como-funciona">Ver Como Funciona</a>
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
