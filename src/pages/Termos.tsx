import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { FileText, Mail } from "lucide-react";

const Termos = () => {
  return (
    <>
      <Helmet>
        <title>Termos de Uso - Avalia Pro</title>
        <meta
          name="description"
          content="Termos de Uso do Avalia Pro - Plataforma de gestão de feedback para restaurantes."
        />
        <link rel="canonical" href="https://avaliapro.online/termos" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-32 pb-20">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-display text-4xl font-bold text-foreground mb-4">
                Termos de Uso
              </h1>
              <p className="text-muted-foreground">
                Última atualização: Janeiro de 2025
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 md:p-12">
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  Os Termos de Uso completos do Avalia Pro estão sendo finalizados e serão publicados em breve.
                </p>

                <p className="text-muted-foreground leading-relaxed mb-8">
                  Ao utilizar nossa plataforma, você concorda com as práticas de coleta e uso de informações 
                  descritas em nossa Política de Privacidade e com as regras de uso do serviço.
                </p>

                <div className="bg-muted/50 rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    Principais Compromissos
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>✓ Respeitamos a privacidade dos seus dados</li>
                    <li>✓ Não compartilhamos informações com terceiros sem consentimento</li>
                    <li>✓ Processamos pagamentos de forma segura via Stripe</li>
                    <li>✓ Você pode cancelar sua assinatura a qualquer momento</li>
                  </ul>
                </div>

                <div className="border-t border-border pt-8">
                  <p className="text-muted-foreground mb-4">
                    Dúvidas sobre nossos termos?
                  </p>
                  <a 
                    href="mailto:contato@avaliapro.online" 
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <Mail className="w-4 h-4" />
                    contato@avaliapro.online
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Termos;
