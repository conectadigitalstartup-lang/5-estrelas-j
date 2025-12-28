import { AlertTriangle, TrendingDown, Users } from "lucide-react";

const stats = [
  {
    icon: AlertTriangle,
    value: "94%",
    description: "dos clientes evitam restaurantes com avaliações negativas",
  },
  {
    icon: TrendingDown,
    value: "-9%",
    description: "de faturamento para cada 1 estrela perdida no Google",
  },
  {
    icon: Users,
    value: "9-15",
    description: "pessoas ouvem sobre cada experiência ruim de um cliente",
  },
];

const ProblemSection = () => {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-destructive font-semibold text-sm uppercase tracking-wider">
            O Problema
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 mb-6">
            Uma Avaliação Negativa Pode Custar Dezenas de Clientes
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Você trabalha duro todos os dias para oferecer a melhor experiência. Mas basta UM cliente insatisfeito postar uma crítica no Google para afastar dezenas de novos clientes que pesquisam antes de escolher onde comer.
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed mt-4">
            O pior? Você nem fica sabendo do problema a tempo de resolver. A crítica já está lá, pública, manchando sua reputação.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-8 text-center hover:shadow-elevated transition-shadow duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4 mx-auto">
                <stat.icon className="w-8 h-8 text-destructive" />
              </div>
              <p className="text-4xl font-bold text-foreground mb-2">
                {stat.value}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
