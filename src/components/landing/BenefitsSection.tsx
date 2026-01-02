import {
  Shield,
  Rocket,
  Bot,
  Camera,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import paparazziBefore from "@/assets/paparazzi-before.jpg";
import paparazziAfter from "@/assets/paparazzi-after.jpg";

const benefits = [
  {
    icon: Shield,
    title: "Filtro de Críticas Inteligente",
    description:
      "Interceptamos avaliações negativas antes que cheguem ao Google. Resolva problemas internamente e receba apenas os elogios publicamente.",
    highlight: "O Core",
  },
  {
    icon: Rocket,
    title: "Gerador de Posts Imediato",
    description:
      "Transforme a avaliação de um cliente feliz em um post lindo para o seu Instagram com 1 clique. Esqueça o bloqueio criativo.",
    highlight: "Marketing Automático",
  },
  {
    icon: Bot,
    title: "Secretária Virtual de Respostas",
    description:
      "Nossa IA escreve respostas perfeitas para cada avaliação. Agradeça elogios e contorne críticas com classe e zero esforço.",
    highlight: "Produtividade com IA",
  },
];

const BenefitsSection = () => {
  return (
    <>
      {/* Main Benefits Section */}
      <section id="beneficios" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-secondary font-semibold text-sm uppercase tracking-wider">
              Funcionalidades com IA
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
              Tudo o Que Você Precisa Para Dominar Sua Reputação
            </h2>
            <p className="text-muted-foreground">
              Ferramentas inteligentes que trabalham por você 24 horas por dia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-xl p-8 hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 group text-center"
              >
                <span className="inline-block text-xs font-semibold text-secondary bg-secondary/10 px-3 py-1 rounded-full mb-4">
                  {benefit.highlight}
                </span>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary/20 transition-colors">
                  <benefit.icon className="w-8 h-8 text-primary group-hover:text-secondary transition-colors" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Paparazzi de Comida - Premium Feature Section */}
      <section className="py-20 bg-navy text-primary-foreground relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-secondary bg-secondary/20 px-4 py-2 rounded-full mb-6">
                  <Camera className="w-4 h-4" />
                  Exclusivo do Plano Profissional
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                  Suas Fotos de Celular com{" "}
                  <span className="text-secondary">Qualidade de Estúdio</span>
                </h2>
                <p className="text-lg text-primary-foreground/70 mb-6">
                  Conheça o <strong className="text-secondary">Paparazzi de Comida</strong> — sua ferramenta secreta para fotos que vendem.
                </p>
                <p className="text-primary-foreground/60 mb-8">
                  Tirou uma foto do prato e o fundo ficou feio? Nossa IA remove a bagunça, melhora a iluminação e coloca seu prato em um cenário profissional em 5 segundos. Perfeito para Instagram, iFood e cardápio.
                </p>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-primary-foreground/80">
                    <span className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-secondary text-sm">✓</span>
                    Remove fundos bagunçados automaticamente
                  </li>
                  <li className="flex items-center gap-3 text-primary-foreground/80">
                    <span className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-secondary text-sm">✓</span>
                    Melhora iluminação e cores do prato
                  </li>
                  <li className="flex items-center gap-3 text-primary-foreground/80">
                    <span className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-secondary text-sm">✓</span>
                    6 cenários profissionais para escolher
                  </li>
                </ul>

                <Button
                  size="lg"
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  asChild
                >
                  <Link to="/cadastro">
                    Experimentar Grátis
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </div>

              {/* Visual - Before/After with real images */}
              <div className="relative">
                <div className="bg-navy-light/50 border border-primary-foreground/10 rounded-2xl p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Before */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-primary-foreground/50 uppercase tracking-wider">Antes</span>
                      <div className="aspect-square rounded-lg overflow-hidden border-2 border-primary-foreground/10 relative group">
                        <img 
                          src={paparazziBefore} 
                          alt="Foto amadora de hambúrguer com fundo de cozinha bagunçado" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <span className="absolute bottom-2 left-2 text-xs text-white/80 bg-black/50 px-2 py-1 rounded">
                          📱 Celular
                        </span>
                      </div>
                    </div>
                    {/* After */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Depois</span>
                      <div className="aspect-square rounded-lg overflow-hidden border-2 border-secondary/50 relative group shadow-lg shadow-secondary/20">
                        <img 
                          src={paparazziAfter} 
                          alt="Foto profissional de hambúrguer com fundo elegante" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        <span className="absolute bottom-2 left-2 text-xs text-white bg-secondary/90 px-2 py-1 rounded font-medium">
                          ✨ IA
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-4 text-primary-foreground/60 text-sm">
                    <span className="inline-block w-8 h-0.5 bg-secondary/50" />
                    <span>Transformação em 5 segundos</span>
                    <span className="inline-block w-8 h-0.5 bg-secondary/50" />
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                  IA Avançada
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BenefitsSection;
