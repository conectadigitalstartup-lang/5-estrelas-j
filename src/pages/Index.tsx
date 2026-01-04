import { Helmet } from "react-helmet-async";
import { lazy, Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import BenefitsSection from "@/components/landing/BenefitsSection";

const TestimonialsSection = lazy(() => import("@/components/landing/TestimonialsSection"));
const PricingSection = lazy(() => import("@/components/landing/PricingSection"));
const FAQSection = lazy(() => import("@/components/landing/FAQSection"));
const CTASection = lazy(() => import("@/components/landing/CTASection"));

const schemaData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Avalia Pro",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "Sistema de gestão de avaliações online para restaurantes. Centralize feedbacks, responda clientes e acompanhe sua reputação no Google.",
  "offers": {
    "@type": "Offer",
    "price": "97",
    "priceCurrency": "BRL"
  }
};

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Avalia Pro - Sistema de Gestão de Avaliações para Restaurantes</title>
        <meta
          name="description"
          content="Centralize feedbacks dos clientes, responda avaliações com IA e acompanhe sua reputação no Google. Teste grátis por 7 dias."
        />
        <meta
          name="keywords"
          content="avaliações google, reputação online, restaurante, reviews, gestão de reputação, qr code, feedback, avalia pro, gestão de avaliações"
        />
        <link rel="canonical" href="https://avaliapro.com.br" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Avalia Pro - Sistema de Gestão de Avaliações para Restaurantes" />
        <meta property="og:description" content="Centralize feedbacks dos clientes, responda avaliações com IA e acompanhe sua reputação no Google." />
        <meta property="og:url" content="https://avaliapro.com.br" />
        <meta property="og:site_name" content="Avalia Pro" />
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:image" content="/og-image.png" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Avalia Pro - Sistema de Gestão de Avaliações para Restaurantes" />
        <meta name="twitter:description" content="Centralize feedbacks dos clientes, responda avaliações com IA e acompanhe sua reputação no Google." />
        <meta name="twitter:image" content="/og-image.png" />
        
        {/* Schema.org */}
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>

      <div className="min-h-screen scroll-smooth">
        <Header />
        <main role="main" aria-label="Conteúdo principal">
          <HeroSection />
          <ProblemSection />
          <HowItWorksSection />
          <BenefitsSection />
          <Suspense fallback={<div className="h-96 bg-background" aria-hidden="true" />}>
            <TestimonialsSection />
            <PricingSection />
            <FAQSection />
            <CTASection />
          </Suspense>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
