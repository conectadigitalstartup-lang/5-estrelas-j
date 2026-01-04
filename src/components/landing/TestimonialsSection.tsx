import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Carlos M.",
    role: "Pizzaria em São Paulo",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    content:
      "O sistema me ajuda a coletar mais feedbacks e resolver problemas antes que virem críticas públicas. Finalmente tenho controle sobre minha reputação.",
    rating: 5,
  },
  {
    name: "Ana Paula",
    role: "Restaurante no Rio de Janeiro",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    content:
      "O gerador de posts é prático demais. Transformo elogios reais em conteúdo pro Instagram sem perder tempo criando do zero.",
    rating: 5,
  },
  {
    name: "Roberto S.",
    role: "Hamburgueria em Belo Horizonte",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    content:
      "Simples de usar. Coloquei o QR Code nas mesas e agora consigo acompanhar os feedbacks em tempo real e responder rapidamente.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section id="depoimentos" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">
            Prova Social
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Restaurantes Que Já Estão Protegidos
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-2xl p-8 relative hover:shadow-elevated transition-shadow duration-300"
            >
              {/* Quote icon */}
              <div className="absolute -top-4 left-8">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <Quote className="w-4 h-4 text-secondary-foreground" />
                </div>
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4 pt-2">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-secondary"
                    fill="currentColor"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground leading-relaxed mb-6">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
