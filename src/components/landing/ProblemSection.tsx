import { AlertTriangle, TrendingDown, Clock, Users } from "lucide-react";

const problems = [
  {
    icon: AlertTriangle,
    title: "Avaliações Negativas Públicas",
    description:
      "Um cliente insatisfeito corre para o Google e deixa uma crítica que todos veem. Isso afasta dezenas de potenciais clientes.",
  },
  {
    icon: TrendingDown,
    title: "Nota Baixa no Google",
    description:
      "Com poucas avaliações positivas e algumas negativas, sua nota despenca. Restaurantes com menos de 4 estrelas perdem 70% dos clientes.",
  },
  {
    icon: Clock,
    title: "Sem Tempo para Gerenciar",
    description:
      "Você está ocupado demais cuidando do restaurante para ficar pedindo reviews ou respondendo críticas online.",
  },
  {
    icon: Users,
    title: "Clientes Felizes Vão Embora",
    description:
      "95% dos clientes satisfeitos saem sem deixar avaliação. Eles amaram a experiência, mas simplesmente esquecem de avaliar.",
  },
];

const ProblemSection = () => {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">
            O Problema
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Sua Reputação Está em Risco
          </h2>
          <p className="text-muted-foreground text-lg">
            Enquanto você se dedica ao seu restaurante, clientes insatisfeitos estão
            destruindo sua imagem online — e os satisfeitos não fazem nada para ajudar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-elevated transition-shadow duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                <problem.icon className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">
                {problem.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
