import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Shield, Mail } from "lucide-react";

const Privacidade = () => {
  return (
    <>
      <Helmet>
        <title>Política de Privacidade - Avalia Pro</title>
        <meta
          name="description"
          content="Política de Privacidade do Avalia Pro - Como coletamos, usamos e protegemos seus dados."
        />
        <link rel="canonical" href="https://avaliapro.online/privacidade" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-32 pb-20">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-display text-4xl font-bold text-foreground mb-4">
                Política de Privacidade
              </h1>
              <p className="text-muted-foreground">
                Última atualização: Janeiro de 2025
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 md:p-12">
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  A Política de Privacidade completa do Avalia Pro está sendo finalizada e será publicada em breve.
                </p>

                <p className="text-muted-foreground leading-relaxed mb-8">
                  Levamos a proteção dos seus dados muito a sério. Abaixo, destacamos nossos principais 
                  compromissos com a sua privacidade.
                </p>

                <div className="bg-muted/50 rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    Nossos Compromissos
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>🔒 Seus dados são criptografados e armazenados com segurança</li>
                    <li>🔒 Não vendemos suas informações para terceiros</li>
                    <li>🔒 Pagamentos são processados pelo Stripe (PCI-DSS compliant)</li>
                    <li>🔒 Você pode solicitar a exclusão dos seus dados a qualquer momento</li>
                    <li>🔒 Cumprimos a Lei Geral de Proteção de Dados (LGPD)</li>
                  </ul>
                </div>

                <div className="bg-primary/5 rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    Dados Coletados
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    Para fornecer nossos serviços, coletamos:
                  </p>
                  <ul className="space-y-1 text-muted-foreground text-sm">
                    <li>• Informações de cadastro (nome, e-mail, nome do estabelecimento)</li>
                    <li>• Feedbacks recebidos dos seus clientes</li>
                    <li>• Dados de uso da plataforma para melhorias</li>
                    <li>• Informações de pagamento (processadas diretamente pelo Stripe)</li>
                  </ul>
                </div>

                <div className="border-t border-border pt-8">
                  <p className="text-muted-foreground mb-4">
                    Dúvidas sobre privacidade?
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

export default Privacidade;
