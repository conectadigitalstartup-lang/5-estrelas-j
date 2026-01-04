import { QrCode, Filter, TrendingUp } from "lucide-react";
import qrScanScene from "@/assets/qr-scan-scene.jpg";

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
    title: "Colete Feedback de Forma Organizada",
    description: "Os clientes compartilham sua experiência. Feedbacks internos vão para sua gestão, e clientes satisfeitos podem optar por compartilhar publicamente no Google.",
  },
  {
    number: "3",
    icon: TrendingUp,
    title: "Acompanhe sua Evolução",
    description: "Visualize o volume de avaliações recebidas, identifique tendências e use os dados para melhorar sua operação continuamente.",
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
            Como o Avalia Pro Organiza Sua Reputação
          </h2>
          <p className="text-muted-foreground text-lg">
            Um sistema simples que trabalha 24 horas por você
          </p>
        </div>

        {/* Static QR scan scene image */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="relative rounded-2xl overflow-hidden shadow-elevated border border-border">
            <img
              src={qrScanScene}
              alt="Cliente escaneando QR code para avaliar experiência"
              className="w-full h-auto"
            />
          </div>
          <p className="text-center text-muted-foreground text-sm mt-4">
            Cliente escaneia o QR Code para avaliar sua experiência
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
