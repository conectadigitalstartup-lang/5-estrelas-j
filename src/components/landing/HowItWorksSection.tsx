import { QrCode, ThumbsUp, MessageSquare, Star, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: QrCode,
    number: "01",
    title: "Cliente Escaneia o QR Code",
    description:
      "Coloque nosso QR Code personalizado na mesa, cardápio ou na conta. O cliente escaneia em segundos com o celular.",
    color: "bg-primary",
  },
  {
    icon: ThumbsUp,
    number: "02",
    title: "Avalia a Experiência",
    description:
      "Uma tela elegante pergunta: 'Como foi sua experiência?' O cliente escolhe de 1 a 5 estrelas de forma rápida e intuitiva.",
    color: "bg-secondary",
  },
  {
    icon: Star,
    number: "03",
    title: "Feliz? Vai para o Google",
    description:
      "Se deu 4 ou 5 estrelas, é direcionado automaticamente para deixar uma avaliação pública no Google. Mais reviews positivos!",
    color: "bg-primary",
  },
  {
    icon: MessageSquare,
    number: "04",
    title: "Insatisfeito? Feedback Privado",
    description:
      "Se deu 1, 2 ou 3 estrelas, abre um formulário privado. O feedback vem direto para você, não vai para o Google.",
    color: "bg-secondary",
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
            Simples, Inteligente, Eficaz
          </h2>
          <p className="text-muted-foreground text-lg">
            Em 4 passos simples, transformamos a forma como seu restaurante coleta e
            gerencia avaliações online.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-elevated transition-all duration-300 h-full">
                  {/* Step number */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-navy flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-xl ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <step.icon className="w-7 h-7 text-primary-foreground" />
                  </div>

                  {/* Content */}
                  <h3 className="font-semibold text-xl text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow connector for desktop */}
                {index < steps.length - 1 && index % 2 === 0 && (
                  <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-border" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
