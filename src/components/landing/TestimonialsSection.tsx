import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Roberto Silva",
    role: "Dono do Restaurante Sabor & Arte",
    location: "São Paulo, SP",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    content:
      "Em 3 meses, nossa nota no Google subiu de 3.8 para 4.6. Os clientes agora nos encontram com facilidade e a casa vive lotada. Investimento que se paga em uma semana.",
    rating: 5,
  },
  {
    name: "Marina Costa",
    role: "Gerente do Café Aroma",
    location: "Rio de Janeiro, RJ",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    content:
      "Antes eu recebia reclamações públicas e não sabia como lidar. Agora os problemas chegam direto no meu email, resolvo na hora e o cliente sai feliz. Recomendo demais!",
    rating: 5,
  },
  {
    name: "Carlos Mendes",
    role: "Proprietário do Bar do Carlão",
    location: "Belo Horizonte, MG",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    content:
      "O QR Code na mesa é sensacional. Os clientes adoram e eu recebo dezenas de reviews novos toda semana. Minha reputação nunca esteve tão boa.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section id="depoimentos" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">
            Depoimentos
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            O Que Nossos Clientes Dizem
          </h2>
          <p className="text-muted-foreground text-lg">
            Restaurantes de todo o Brasil já transformaram sua reputação online com a
            Máquina de Reviews.
          </p>
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
                  <p className="text-xs text-muted-foreground">{testimonial.location}</p>
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
