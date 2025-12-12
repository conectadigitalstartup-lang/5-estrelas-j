import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection from "@/components/landing/CTASection";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Máquina de Reviews - Transforme Clientes em 5 Estrelas no Google</title>
        <meta
          name="description"
          content="Sistema inteligente de gestão de reputação online para restaurantes. Aumente suas avaliações no Google e proteja sua marca de críticas negativas. Teste grátis por 14 dias."
        />
        <meta
          name="keywords"
          content="avaliações google, reputação online, restaurante, reviews, gestão de reputação, qr code, feedback"
        />
        <link rel="canonical" href="https://maquinadereviews.com.br" />
      </Helmet>

      <div className="min-h-screen">
        <Header />
        <main>
          <HeroSection />
          <ProblemSection />
          <HowItWorksSection />
          <BenefitsSection />
          <TestimonialsSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
