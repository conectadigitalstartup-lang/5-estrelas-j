import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Check, Lock, Shield, Clock, Star, ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const profissionalFeatures = [
  { emoji: "✅", text: "1 Restaurante por assinatura" },
  { emoji: "📋", text: "Canal de Feedback Interno Centralizado" },
  { emoji: "🌐", text: "Convite para Avaliação Pública no Google" },
  { emoji: "📊", text: "Dashboard de Métricas em Tempo Real" },
  { emoji: "🤖", text: "Assistente de IA para Respostas" },
  { emoji: "📸", text: "Gerador de Posts para Instagram com IA" },
  { emoji: "📱", text: "QR Code Dinâmico para mesas" },
  { emoji: "📧", text: "Notificações de novos feedbacks por e-mail" },
  { emoji: "💬", text: "Suporte Prioritário via WhatsApp" },
];

const basicoFeatures = [
  { text: "QR Code Dinâmico" },
  { text: "Dashboard de Métricas" },
  { text: "Notificações por E-mail" },
];

const agenciaFeatures = [
  { text: "Múltiplos Restaurantes" },
  { text: "Relatórios Consolidados" },
  { text: "Gerenciamento de Equipe" },
  { text: "API de Integração" },
];

const securityFaqs = [
  {
    question: "Preciso colocar meu cartão para o teste grátis?",
    answer: "NÃO! Você pode testar o Avalia Pro por 7 dias completamente grátis, sem precisar cadastrar cartão de crédito. Só pedimos o cartão se você decidir assinar após o teste."
  },
  {
    question: "O que acontece após os 7 dias?",
    answer: "Após os 7 dias, você precisará assinar o plano Profissional para continuar usando. Seu QR Code será desativado até você assinar, mas seus dados ficam salvos."
  },
  {
    question: "Meus dados de cartão estão seguros?",
    answer: "100% seguros. Usamos o Stripe, a mesma plataforma de pagamentos usada por empresas como Google, Amazon e Uber. Seus dados são criptografados e nunca passam pelos nossos servidores."
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer: "Sim! Você pode cancelar sua assinatura a qualquer momento, sem multas ou taxas extras. Basta acessar o portal de assinatura."
  }
];

const Precos = () => {
  return (
    <>
      <Helmet>
        <title>Preços - Avalia Pro | Planos para Restaurantes</title>
        <meta
          name="description"
          content="Conheça os planos do Avalia Pro. A partir de R$97/mês. Teste grátis por 7 dias. Cancele quando quiser."
        />
        <link rel="canonical" href="https://avaliapro.com.br/precos" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-32 pb-20">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-secondary font-semibold text-sm uppercase tracking-wider">
                Investimento
              </span>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
                Escolha o Plano Ideal Para Você
              </h1>
              <p className="text-muted-foreground text-lg">
                Menos do que uma única refeição no seu restaurante. Teste grátis por 7 dias.
              </p>
            </div>

            {/* Plans - 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Plano Básico - Em Breve */}
              <div className="bg-card/50 border border-border/50 rounded-2xl p-8 relative opacity-60">
                {/* Badge Em Breve */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-muted text-muted-foreground text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-1.5 border border-border">
                    <Clock className="w-3 h-3" />
                    EM BREVE
                  </span>
                </div>

                <div className="mb-6 mt-4 text-center">
                  <h3 className="text-xl font-bold text-muted-foreground mb-1">
                    Plano Básico
                  </h3>
                  <p className="text-muted-foreground/70 text-sm">Para quem está começando</p>
                </div>

                <div className="text-center mb-8">
                  <span className="text-3xl font-bold text-muted-foreground/50">Em Breve</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {basicoFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-muted-foreground/40 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground/70">
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  variant="outline"
                  className="w-full text-lg py-6 opacity-50 cursor-not-allowed"
                  disabled
                >
                  Disponível em Breve
                </Button>
              </div>

              {/* Plano Profissional - Destaque */}
              <div className="bg-card border-2 border-secondary rounded-2xl p-8 relative shadow-elevated transform md:scale-105 z-10">
                {/* Badge Mais Popular */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-secondary text-secondary-foreground text-sm font-semibold px-5 py-2 rounded-full flex items-center gap-1.5 shadow-lg">
                    <Star className="w-4 h-4 fill-current" />
                    Mais Popular
                  </span>
                </div>

                <div className="mb-6 mt-4 text-center">
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    Plano Profissional
                  </h3>
                  <p className="text-muted-foreground text-sm">Tudo que você precisa</p>
                </div>

                <div className="text-center mb-2">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-muted-foreground text-lg">R$</span>
                    <span className="text-5xl font-bold text-foreground">97</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-1 italic">
                    *Cancele quando quiser
                  </p>
                </div>

                <ul className="space-y-3 mb-8 mt-6">
                  {profissionalFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-lg shrink-0">{feature.emoji}</span>
                      <span className="text-foreground text-sm leading-relaxed">
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-lg py-6 shadow-lg"
                  asChild
                >
                  <Link to="/cadastro">
                    Começar Teste Grátis de 7 Dias
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>

                <p className="text-center text-muted-foreground text-sm mt-4">
                  Você só paga depois de 7 dias
                </p>
              </div>

              {/* Plano Agência - Em Breve */}
              <div className="bg-card/50 border border-border/50 rounded-2xl p-8 relative opacity-60">
                {/* Badge Em Breve */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-muted text-muted-foreground text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-1.5 border border-border">
                    <Clock className="w-3 h-3" />
                    EM BREVE
                  </span>
                </div>

                <div className="mb-6 mt-4 text-center">
                  <h3 className="text-xl font-bold text-muted-foreground mb-1">
                    Plano Agência
                  </h3>
                  <p className="text-muted-foreground/70 text-sm">Para múltiplos negócios</p>
                </div>

                <div className="text-center mb-8">
                  <span className="text-2xl font-bold text-muted-foreground/50">Fale Conosco</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {agenciaFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-muted-foreground/40 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground/70">
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  variant="outline"
                  className="w-full text-lg py-6 opacity-50 cursor-not-allowed"
                  disabled
                >
                  Disponível em Breve
                </Button>
              </div>
            </div>

            {/* Security badges */}
            <div className="mt-16 text-center">
              <div className="flex flex-wrap items-center justify-center gap-6 mb-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Shield className="w-4 h-4" />
                  <span>Pagamento seguro via Stripe</span>
                </div>
                <div className="text-muted-foreground text-sm">
                  Cancele a qualquer momento
                </div>
                <div className="text-muted-foreground text-sm">
                  Sem taxa de cancelamento
                </div>
              </div>
              
              <div className="inline-flex items-center gap-2 bg-muted/50 px-6 py-3 rounded-full mb-4">
                <Lock className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Pagamento 100% seguro</span>
              </div>
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="bg-white px-3 py-2 rounded-lg border shadow-sm text-sm font-bold text-blue-600">VISA</div>
                <div className="bg-white px-3 py-2 rounded-lg border shadow-sm text-sm font-bold text-red-500">Mastercard</div>
                <div className="bg-white px-3 py-2 rounded-lg border shadow-sm text-sm font-bold text-blue-400">Amex</div>
                <div className="bg-white px-3 py-2 rounded-lg border shadow-sm text-sm font-bold text-purple-600">Stripe</div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 max-w-md mx-auto">
                Processado por Stripe. Seus dados são criptografados e nunca armazenados em nossos servidores.
              </p>
            </div>

            {/* Security FAQ */}
            <div className="mt-20 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-center text-foreground mb-8">
                Perguntas sobre Pagamento
              </h2>
              <Accordion type="single" collapsible className="space-y-4">
                {securityFaqs.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`}
                    className="bg-card border border-border rounded-xl px-6"
                  >
                    <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-4">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-secondary flex-shrink-0" />
                        {faq.question}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4 pl-8">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* CTA */}
            <div className="mt-20 text-center">
              <p className="text-muted-foreground mb-4">
                Ainda com dúvidas? Fale conosco pelo WhatsApp
              </p>
              <Button variant="outline" size="lg" asChild>
                <a 
                  href="https://wa.me/5511999999999?text=Olá! Gostaria de saber mais sobre o Avalia Pro."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Falar com um Especialista
                </a>
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Precos;
