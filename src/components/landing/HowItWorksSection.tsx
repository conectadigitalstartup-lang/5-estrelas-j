import { QrCode, Filter, TrendingUp } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: QrCode,
    title: "Coloque o QR Code nas Mesas",
    description: "Você recebe um QR Code exclusivo e um display profissional para imprimir. Seus clientes escaneiam ao final da refeição.",
  },
  {
    number: "2",
    icon: Filter,
    title: "O Filtro Inteligente Entra em Ação",
    description: "Se o cliente está insatisfeito (nota 1-3), o feedback vem direto para você resolver internamente — longe do Google. Se está satisfeito (nota 4-5), ele é convidado a avaliar você publicamente no Google.",
  },
  {
    number: "3",
    icon: TrendingUp,
    title: "Sua Nota Sobe, Seu Restaurante Enche",
    description: "Com mais avaliações positivas e menos negativas públicas, sua nota no Google aumenta. Novos clientes te encontram e escolhem você.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="como-funciona" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">
            Como Funciona
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Como o Avalia Pro Protege e Aumenta Sua Reputação
          </h2>
          <p className="text-muted-foreground text-lg">
            Um sistema simples que trabalha 24 horas por você
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-2xl p-8 text-center hover:shadow-elevated transition-all duration-300 relative"
              >
                {/* Step number badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-secondary text-secondary-foreground font-bold flex items-center justify-center text-sm">
                  {step.number}
                </div>
                
                <div className="w-20 h-20 rounded-2xl bg-primary mx-auto flex items-center justify-center mb-6 mt-2">
                  <step.icon className="w-10 h-10 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-xl text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
