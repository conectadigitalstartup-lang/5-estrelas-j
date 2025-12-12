import {
  Star,
  Shield,
  TrendingUp,
  Clock,
  Bell,
  BarChart3,
  Smartphone,
  Palette,
} from "lucide-react";

const benefits = [
  {
    icon: Star,
    title: "Mais Avaliações 5 Estrelas",
    description:
      "Direcione automaticamente clientes satisfeitos para o Google. Aumente suas avaliações positivas sem esforço.",
  },
  {
    icon: Shield,
    title: "Proteção da Reputação",
    description:
      "Feedbacks negativos ficam privados. Resolva problemas antes que virem críticas públicas.",
  },
  {
    icon: TrendingUp,
    title: "Melhore sua Nota no Google",
    description:
      "Com mais reviews positivos e menos negativos públicos, sua nota sobe naturalmente.",
  },
  {
    icon: Clock,
    title: "Economize Tempo",
    description:
      "Sistema 100% automatizado. Configure uma vez e deixe a máquina trabalhar por você.",
  },
  {
    icon: Bell,
    title: "Alertas em Tempo Real",
    description:
      "Receba notificações por email quando um cliente deixar feedback negativo. Aja rapidamente.",
  },
  {
    icon: BarChart3,
    title: "Dashboard Completo",
    description:
      "Acompanhe métricas importantes: scans, reviews, taxa de satisfação e tendências.",
  },
  {
    icon: Smartphone,
    title: "QR Code Inteligente",
    description:
      "Códigos personalizados com sua marca. Estatísticas individuais por mesa ou unidade.",
  },
  {
    icon: Palette,
    title: "100% Personalizável",
    description:
      "Adicione seu logo, cores e mensagens. A experiência do cliente reflete sua marca.",
  },
];

const BenefitsSection = () => {
  return (
    <section id="beneficios" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">
            Benefícios
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Tudo Que Você Precisa Para Dominar o Google
          </h2>
          <p className="text-muted-foreground text-lg">
            Uma solução completa que trabalha 24/7 para melhorar sua reputação online.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                <benefit.icon className="w-6 h-6 text-primary group-hover:text-secondary transition-colors" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
