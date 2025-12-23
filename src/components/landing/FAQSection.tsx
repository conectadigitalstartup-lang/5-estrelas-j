import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Quanto tempo leva para ver resultados?",
    answer:
      "A maioria dos nossos clientes vê um aumento nas avaliações 5 estrelas já na primeira semana de uso.",
  },
  {
    question: "Isso é contra as regras do Google?",
    answer:
      "Não. O Avalia Pro não compra reviews falsos. Apenas facilita que seus clientes REAIS deixem avaliações. Isso é 100% permitido.",
  },
  {
    question: "E se eu quiser cancelar?",
    answer:
      "Você pode cancelar a qualquer momento, sem multas ou burocracia. Seu teste de 14 dias é totalmente gratuito.",
  },
  {
    question: "Funciona para qualquer tipo de negócio?",
    answer:
      "Sim! Apesar de ser otimizado para restaurantes, funciona para qualquer negócio que receba clientes presencialmente: salões, clínicas, lojas, etc.",
  },
  {
    question: "Preciso instalar algum aplicativo?",
    answer:
      "Não. O Avalia Pro é 100% web. Você só precisa imprimir o QR Code e colocar nas mesas.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">
            Dúvidas Frequentes
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-muted-foreground text-lg">
            Tire suas dúvidas sobre o Avalia Pro
          </p>
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
