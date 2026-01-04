import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Shield, ArrowRight, Star, Clock } from "lucide-react";

const profissionalFeatures = [
  { emoji: "✅", text: "1 Restaurante por assinatura" },
  { emoji: "📋", text: "Canal de Feedback Interno Centralizado" },
  { emoji: "🌐", text: "Convite para Avaliação Pública no Google" },
  { emoji: "📊", text: "Dashboard de Métricas em Tempo Real" },
  { emoji: "🤖", text: "Assistente de IA para Respostas" },
  { emoji: "📸", text: "Gerador de Posts para Instagram com IA" },
  { emoji: "📱", text: "QR Code Dinâmico para mesas" },
  { emoji: "📧", text: "Notificações de novos feedbacks por e-mail" },
  { emoji: "💬", text: "Suporte Prioritário via WhatsApp" },
];

const basicoFeatures = [
  { text: "QR Code Dinâmico" },
  { text: "Dashboard de Métricas" },
  { text: "Notificações por E-mail" },
];

const agenciaFeatures = [
  { text: "Múltiplos Restaurantes" },
  { text: "Relatórios Consolidados" },
  { text: "Gerenciamento de Equipe" },
  { text: "API de Integração" },
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

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Plano Básico - Em Breve */}
          <div className="bg-card/50 border border-border/50 rounded-2xl p-8 relative opacity-60">
            {/* Badge Em Breve */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-muted text-muted-foreground text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-1.5 border border-border">
                <Clock className="w-3 h-3" />
                EM BREVE
              </span>
            </div>

            <div className="mb-6 mt-4">
              <h3 className="text-xl font-bold text-muted-foreground mb-1">
                Plano Básico
              </h3>
              <p className="text-muted-foreground/70 text-sm">Para quem está começando</p>
            </div>

            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-3xl font-bold text-muted-foreground/50">Em Breve</span>
            </div>

            <ul className="space-y-4 mb-8">
              {basicoFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-muted-foreground/40 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground/70">
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              size="lg"
              variant="outline"
              className="w-full text-lg py-6 opacity-50 cursor-not-allowed"
              disabled
            >
              Disponível em Breve
            </Button>
          </div>

          {/* Plano Profissional - Destaque */}
          <div className="bg-card border-2 border-secondary rounded-2xl p-8 relative shadow-elevated transform md:scale-105 z-10">
            {/* Badge Mais Popular */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-secondary text-secondary-foreground text-sm font-semibold px-5 py-2 rounded-full flex items-center gap-1.5 shadow-lg">
                <Star className="w-4 h-4 fill-current" />
                Mais Popular
              </span>
            </div>

            <div className="mb-6 mt-4">
              <h3 className="text-xl font-bold text-foreground mb-1">
                Plano Profissional
              </h3>
              <p className="text-muted-foreground text-sm">Tudo que você precisa</p>
            </div>

            <div className="mb-2">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">R$ 97</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <p className="text-muted-foreground text-sm mt-1 italic">
                *Cancele quando quiser
              </p>
            </div>

            <ul className="space-y-3 mb-8 mt-6">
              {profissionalFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-lg shrink-0">{feature.emoji}</span>
                  <span className="text-foreground text-sm leading-relaxed">
                    <strong>{feature.text.split(" ")[0]}</strong> {feature.text.split(" ").slice(1).join(" ")}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              size="lg"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-lg py-6 shadow-lg"
              asChild
            >
              <Link to="/cadastro">
                Começar Teste Grátis de 7 Dias
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>

            <p className="text-center text-muted-foreground text-sm mt-4">
              Você só paga depois de 7 dias
            </p>
          </div>

          {/* Plano Agência - Em Breve */}
          <div className="bg-card/50 border border-border/50 rounded-2xl p-8 relative opacity-60">
            {/* Badge Em Breve */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-muted text-muted-foreground text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-1.5 border border-border">
                <Clock className="w-3 h-3" />
                EM BREVE
              </span>
            </div>

            <div className="mb-6 mt-4">
              <h3 className="text-xl font-bold text-muted-foreground mb-1">
                Plano Agência
              </h3>
              <p className="text-muted-foreground/70 text-sm">Para múltiplos negócios</p>
            </div>

            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-2xl font-bold text-muted-foreground/50">Fale Conosco</span>
            </div>

            <ul className="space-y-4 mb-8">
              {agenciaFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-muted-foreground/40 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground/70">
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              size="lg"
              variant="outline"
              className="w-full text-lg py-6 opacity-50 cursor-not-allowed"
              disabled
            >
              Disponível em Breve
            </Button>
          </div>
        </div>

        {/* Security badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-10">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Shield className="w-4 h-4" />
            <span>Pagamento seguro via Stripe</span>
          </div>
          <div className="text-muted-foreground text-sm">
            Cancele a qualquer momento
          </div>
          <div className="text-muted-foreground text-sm">
            Sem taxa de cancelamento
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
