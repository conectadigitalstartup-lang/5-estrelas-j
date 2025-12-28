import {
  Shield,
  TrendingUp,
  BarChart3,
  Bell,
  Instagram,
  QrCode,
} from "lucide-react";

const benefits = [
  {
    icon: Shield,
    title: "Proteção Contra Críticas Públicas",
    description:
      "Feedbacks negativos chegam para você, não para o Google. Resolva problemas antes que virem crises.",
  },
  {
    icon: TrendingUp,
    title: "Aumento da Nota no Google",
    description:
      "Clientes satisfeitos são direcionados para avaliar você no Google. Sua nota sobe organicamente.",
  },
  {
    icon: BarChart3,
    title: "Dashboard em Tempo Real",
    description:
      "Acompanhe todos os feedbacks, sua nota atual e a evolução da sua reputação em um painel simples e visual.",
  },
  {
    icon: Bell,
    title: "Alertas Instantâneos",
    description:
      "Receba notificações quando chegar um feedback negativo. Aja rápido e recupere o cliente.",
  },
  {
    icon: Instagram,
    title: "Gerador de Posts para Redes Sociais",
    description:
      "Transforme elogios de clientes em posts profissionais para Instagram com 1 clique. Marketing autêntico, zero esforço.",
  },
  {
    icon: QrCode,
    title: "Material de Mesa Profissional",
    description:
      "Receba seu QR Code personalizado e um display elegante pronto para imprimir e colocar nas mesas.",
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
            Tudo o Que Você Precisa Para Dominar Sua Reputação
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
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
