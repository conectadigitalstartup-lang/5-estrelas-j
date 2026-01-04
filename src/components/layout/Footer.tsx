import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Shield, Lock, HeartHandshake, Instagram } from "lucide-react";
import avaliaProShield from "@/assets/avalia-pro-shield.jpg";

const Footer = () => {
  return (
    <footer className="bg-navy text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-[#0f172a] flex items-center justify-center">
                <img 
                  src={avaliaProShield} 
                  alt="Avalia Pro" 
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-display font-bold text-primary-foreground text-xl">Avalia Pro</span>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-4">
              Plataforma de gestão de feedback e reputação online para restaurantes, bares e cafeterias.
            </p>
            <p className="text-primary-foreground/50 text-xs">
              Um produto da ConectaRestô
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

          {/* Suporte & Legal */}
          <div>
            <h4 className="font-semibold text-secondary mb-4">Suporte</h4>
            <ul className="space-y-3">
              <li>
                <a href="#faq" className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
                  Perguntas Frequentes
                </a>
              </li>
              <li>
                <Link to="/termos" className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/privacidade" className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-semibold text-secondary mb-4">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-primary-foreground/70 text-sm">
                <Mail className="w-4 h-4" />
                contato@avaliapro.online
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/70 text-sm">
                <Phone className="w-4 h-4" />
                suporte@avaliapro.online
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/70 text-sm">
                <MapPin className="w-4 h-4" />
                São Paulo, SP - Brasil
              </li>
            </ul>
            
            {/* Redes Sociais */}
            <div className="mt-6">
              <h5 className="font-medium text-primary-foreground/80 text-sm mb-3">Siga o Avalia Pro</h5>
              <a
                href="https://www.instagram.com/avaliapro.app/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram do AvaliaPro"
                className="inline-flex items-center gap-2 text-primary-foreground/60 hover:text-secondary transition-colors text-sm"
              >
                <Instagram className="w-4 h-4" />
                @avaliapro.app
              </a>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-wrap items-center justify-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-primary-foreground/60 text-sm">
              <Shield className="w-4 h-4" />
              <span>Pagamento Seguro via Stripe</span>
            </div>
            <div className="flex items-center gap-2 text-primary-foreground/60 text-sm">
              <Lock className="w-4 h-4" />
              <span>Dados Protegidos</span>
            </div>
            <div className="flex items-center gap-2 text-primary-foreground/60 text-sm">
              <HeartHandshake className="w-4 h-4" />
              <span>Suporte Humanizado</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-primary-foreground/10">
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
