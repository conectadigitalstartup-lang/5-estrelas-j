import { QrCode, Filter, Star, Mail } from "lucide-react";

const HowItWorksSection = () => {
  return (
    <section id="como-funciona" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">
            Como Funciona
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Como o Avalia Pro protege sua reputação
          </h2>
          <p className="text-muted-foreground text-lg">
            Um sistema inteligente que filtra as avaliações automaticamente
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Flow Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1 - Entrada */}
            <div className="bg-card border border-border rounded-2xl p-8 text-center hover:shadow-elevated transition-all duration-300">
              <div className="w-20 h-20 rounded-2xl bg-primary mx-auto flex items-center justify-center mb-6">
                <QrCode className="w-10 h-10 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-xl text-foreground mb-3">
                1. Cliente escaneia
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Seu cliente escaneia o QR Code na mesa e avalia a experiência em segundos.
              </p>
            </div>

            {/* Column 2 - Filtro */}
            <div className="bg-card border border-border rounded-2xl p-8 text-center hover:shadow-elevated transition-all duration-300">
              <div className="w-20 h-20 rounded-2xl bg-secondary mx-auto flex items-center justify-center mb-6">
                <Filter className="w-10 h-10 text-secondary-foreground" />
              </div>
              <h3 className="font-semibold text-xl text-foreground mb-3">
                2. Triagem automática
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Nosso sistema analisa a nota e direciona o cliente para o caminho certo.
              </p>
            </div>

            {/* Column 3 - Two Outputs */}
            <div className="space-y-4">
              {/* Happy Customer */}
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Star className="w-6 h-6 text-emerald-600" fill="currentColor" />
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    Cliente feliz?
                  </span>
                </div>
                <p className="text-sm text-emerald-600 dark:text-emerald-300">
                  Vai direto para o Google deixar uma avaliação pública 5 estrelas.
                </p>
                <div className="flex justify-center gap-1 mt-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 text-gold" fill="currentColor" />
                  ))}
                </div>
              </div>

              {/* Unhappy Customer */}
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Mail className="w-6 h-6 text-amber-600" />
                  <span className="font-semibold text-amber-700 dark:text-amber-400">
                    Cliente insatisfeito?
                  </span>
                </div>
                <p className="text-sm text-amber-600 dark:text-amber-300">
                  Feedback vai privado para você resolver antes de virar crítica pública.
                </p>
              </div>
            </div>
          </div>

          {/* Result Message */}
          <div className="mt-12 text-center">
            <div className="inline-block bg-primary/5 border border-primary/20 rounded-2xl px-8 py-6">
              <p className="text-lg font-medium text-foreground">
                <span className="text-secondary font-bold">Resultado:</span> Sua nota no Google sobe organicamente enquanto você tem a chance de corrigir problemas internamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
