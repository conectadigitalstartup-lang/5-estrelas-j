import { Link } from "react-router-dom";
import { Star, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-navy text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Star className="w-6 h-6 text-navy" fill="currentColor" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-xl font-bold text-primary-foreground">
                  Avalia Pro
                </span>
                <span className="text-[10px] text-primary-foreground/60">
                  Gestão de Reputação Online
                </span>
              </div>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              O filtro inteligente que transforma clientes satisfeitos em reviews no Google e protege sua reputação.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-secondary mb-4">Produto</h4>
            <ul className="space-y-3">
              <li>
                <a href="#como-funciona" className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
                  Como Funciona
                </a>
              </li>
              <li>
                <Link to="/precos" className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
                  Preços
                </Link>
              </li>
              <li>
                <a href="#beneficios" className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
                  Benefícios
                </a>
              </li>
              <li>
                <a href="#depoimentos" className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
                  Depoimentos
                </a>
              </li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h4 className="font-semibold text-secondary mb-4">Suporte</h4>
            <ul className="space-y-3">
              <li>
                <a href="#faq" className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
                  Perguntas Frequentes
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
                  Política de Privacidade
                </a>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-semibold text-secondary mb-4">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-primary-foreground/70 text-sm">
                <Mail className="w-4 h-4" />
                contato@avaliapro.com.br
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/70 text-sm">
                <Phone className="w-4 h-4" />
                (11) 99999-9999
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/70 text-sm">
                <MapPin className="w-4 h-4" />
                São Paulo, SP - Brasil
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-primary-foreground/50 text-sm">
              © 2025 Avalia Pro. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-primary-foreground/50 text-sm">
                Feito com ❤️ para restaurantes brasileiros
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
