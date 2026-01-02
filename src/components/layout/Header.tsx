import { useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import avaliaProShield from "@/assets/avalia-pro-shield.jpg";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToSection = useCallback((sectionId: string) => {
    setIsMenuOpen(false);
    
    // If not on home page, navigate first then scroll
    if (location.pathname !== "/") {
      navigate("/");
      // Wait for navigation to complete then scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
      }, 100);
    } else {
      // Already on home page, just scroll
      const element = document.getElementById(sectionId);
      if (element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }
  }, [location.pathname, navigate]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="h-10 md:h-12 w-10 md:w-12 rounded-full overflow-hidden bg-[#0f172a] flex items-center justify-center">
              <img 
                src={avaliaProShield} 
                alt="Avalia Pro" 
                className="h-full w-full object-cover"
              />
            </div>
            <span className="font-display font-bold text-foreground text-lg md:text-xl">Avalia Pro</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Início
            </Link>
            <Link
              to="/precos"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Preços
            </Link>
            <button
              onClick={() => scrollToSection("como-funciona")}
              className="text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer"
            >
              Como Funciona
            </button>
            <button
              onClick={() => scrollToSection("beneficios")}
              className="text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer"
            >
              Benefícios
            </button>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/auth">Entrar</Link>
            </Button>
            <Button className="bg-secondary text-secondary-foreground hover:bg-gold-dark" asChild>
              <Link to="/cadastro">Teste Grátis</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              <Link
                to="/"
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Início
              </Link>
              <Link
                to="/precos"
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Preços
              </Link>
              <button
                onClick={() => scrollToSection("como-funciona")}
                className="text-muted-foreground hover:text-foreground transition-colors py-2 text-left bg-transparent border-none cursor-pointer"
              >
                Como Funciona
              </button>
              <button
                onClick={() => scrollToSection("beneficios")}
                className="text-muted-foreground hover:text-foreground transition-colors py-2 text-left bg-transparent border-none cursor-pointer"
              >
                Benefícios
              </button>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button variant="outline" asChild>
                  <Link to="/auth">Entrar</Link>
                </Button>
                <Button className="bg-secondary text-secondary-foreground hover:bg-gold-dark" asChild>
                  <Link to="/cadastro">Teste Grátis</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
