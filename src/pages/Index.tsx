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
  "description": "Proteja seu restaurante de avaliações negativas e aumente sua nota no Google. Sistema inteligente de gestão de reputação online para restaurantes.",
  "offers": {
    "@type": "Offer",
    "price": "99",
    "priceCurrency": "BRL"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "150"
  }
};

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Avalia Pro - Proteja Seu Restaurante de Avaliações Negativas</title>
        <meta
          name="description"
          content="O Avalia Pro intercepta feedbacks negativos antes que virem críticas públicas e direciona clientes satisfeitos para avaliarem você no Google. Teste grátis por 7 dias."
        />
        <meta
          name="keywords"
          content="avaliações google, reputação online, restaurante, reviews, gestão de reputação, qr code, feedback, avalia pro, proteger reputação"
        />
        <link rel="canonical" href="https://avaliapro.com.br" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Avalia Pro - Proteja Seu Restaurante de Avaliações Negativas" />
        <meta property="og:description" content="O Avalia Pro intercepta feedbacks negativos antes que virem críticas públicas e direciona clientes satisfeitos para avaliarem você no Google." />
        <meta property="og:url" content="https://avaliapro.com.br" />
        <meta property="og:site_name" content="Avalia Pro" />
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:image" content="/og-image.png" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Avalia Pro - Proteja Seu Restaurante de Avaliações Negativas" />
        <meta name="twitter:description" content="O Avalia Pro intercepta feedbacks negativos antes que virem críticas públicas e direciona clientes satisfeitos para avaliarem você no Google." />
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
