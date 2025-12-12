import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Shield, TrendingUp } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-navy bg-hero-pattern">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-gold/5 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-foreground/10 border border-primary-foreground/20 rounded-full px-4 py-2 mb-8 animate-fade-in">
            <Star className="w-4 h-4 text-secondary" fill="currentColor" />
            <span className="text-primary-foreground/90 text-sm font-medium">
              Teste grátis por 14 dias
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Transforme Clientes Satisfeitos em{" "}
            <span className="text-gradient-gold">5 Estrelas no Google</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Sistema inteligente que filtra experiências via QR Code. Clientes felizes vão
            para o Google. Clientes insatisfeitos deixam feedback privado. Sua reputação,
            protegida.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button
              size="lg"
              className="bg-secondary text-secondary-foreground hover:bg-gold-dark text-lg px-8 py-6 shadow-gold"
              asChild
            >
              <Link to="/cadastro">
                Começar Teste Grátis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-lg px-8 py-6"
              asChild
            >
              <a href="#como-funciona">Ver Como Funciona</a>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-xl p-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-5 h-5 text-secondary" fill="currentColor" />
                <span className="text-3xl font-bold text-primary-foreground">4.8</span>
              </div>
              <p className="text-primary-foreground/60 text-sm">
                Média de avaliações dos clientes
              </p>
            </div>

            <div className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-xl p-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-secondary" />
                <span className="text-3xl font-bold text-primary-foreground">92%</span>
              </div>
              <p className="text-primary-foreground/60 text-sm">
                Feedbacks negativos filtrados
              </p>
            </div>

            <div className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-xl p-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-secondary" />
                <span className="text-3xl font-bold text-primary-foreground">+47%</span>
              </div>
              <p className="text-primary-foreground/60 text-sm">
                Aumento em reviews positivos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
