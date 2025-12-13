import { Helmet } from "react-helmet-async";
import { lazy, Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import BenefitsSection from "@/components/landing/BenefitsSection";

const TestimonialsSection = lazy(() => import("@/components/landing/TestimonialsSection"));
const CTASection = lazy(() => import("@/components/landing/CTASection"));

const schemaData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Máquina de Reviews",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "Sistema inteligente de gestão de reputação online para restaurantes. Aumente suas avaliações no Google e proteja sua marca de críticas negativas.",
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "97",
    "highPrice": "397",
    "priceCurrency": "BRL",
    "offerCount": "3"
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
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Máquina de Reviews - Transforme Clientes em 5 Estrelas no Google" />
        <meta property="og:description" content="Sistema inteligente de gestão de reputação online para restaurantes. Aumente suas avaliações no Google e proteja sua marca." />
        <meta property="og:url" content="https://maquinadereviews.com.br" />
        <meta property="og:site_name" content="Máquina de Reviews" />
        <meta property="og:locale" content="pt_BR" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Máquina de Reviews - Transforme Clientes em 5 Estrelas no Google" />
        <meta name="twitter:description" content="Sistema inteligente de gestão de reputação online para restaurantes. Aumente suas avaliações no Google." />
        
        {/* Schema.org */}
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>

      <div className="min-h-screen scroll-smooth">
        <Header />
        <main role="main" aria-label="Conteúdo principal">
          <section id="hero" aria-labelledby="hero-title">
            <HeroSection />
          </section>
          <section id="problema" aria-labelledby="problem-title">
            <ProblemSection />
          </section>
          <section id="como-funciona" aria-labelledby="how-it-works-title">
            <HowItWorksSection />
          </section>
          <section id="beneficios" aria-labelledby="benefits-title">
            <BenefitsSection />
          </section>
          <Suspense fallback={<div className="h-96 bg-background" aria-hidden="true" />}>
            <section id="depoimentos" aria-labelledby="testimonials-title">
              <TestimonialsSection />
            </section>
            <section id="cta" aria-labelledby="cta-title">
              <CTASection />
            </section>
          </Suspense>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
