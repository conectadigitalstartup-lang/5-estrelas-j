import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Preciso de conhecimento técnico para usar?",
    answer:
      "Não. Você cria sua conta, cadastra seu restaurante e em 5 minutos já tem seu QR Code pronto. É só imprimir e colocar nas mesas.",
  },
  {
    question: "E se eu não gostar, posso cancelar?",
    answer:
      "Sim. Você tem 7 dias grátis para testar tudo. Se não gostar, cancela sem pagar nada. Sem burocracia.",
  },
  {
    question: "Funciona para qualquer tipo de restaurante?",
    answer:
      "Sim. Pizzarias, hamburguerias, restaurantes tradicionais, bares, cafeterias... qualquer estabelecimento que atenda clientes presencialmente.",
  },
  {
    question: "Como o QR Code chega até mim?",
    answer:
      "Você gera e baixa o QR Code direto na plataforma, junto com um display profissional em PDF. É só imprimir em qualquer gráfica ou impressora.",
  },
  {
    question: "O cliente é obrigado a deixar feedback?",
    answer:
      "Não. É 100% voluntário. Mas clientes que tiveram uma boa experiência adoram compartilhar, especialmente quando é rápido e fácil.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">
            Dúvidas
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Perguntas Frequentes
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
