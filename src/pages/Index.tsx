import { Helmet } from "react-helmet-async";
import { lazy, Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import BenefitsSection from "@/components/landing/BenefitsSection";

const TestimonialsSection = lazy(() => import("@/components/landing/TestimonialsSection"));
const FAQSection = lazy(() => import("@/components/landing/FAQSection"));
const CTASection = lazy(() => import("@/components/landing/CTASection"));

const schemaData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Avalia Pro",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "A sua máquina de reviews 5 estrelas. Sistema inteligente de gestão de reputação online para restaurantes.",
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
        <title>Avalia Pro - A sua máquina de reviews 5 estrelas</title>
        <meta
          name="description"
          content="Proteja a reputação do seu restaurante e dobre suas avaliações 5 estrelas em 30 dias. O filtro inteligente que transforma clientes satisfeitos em reviews no Google."
        />
        <meta
          name="keywords"
          content="avaliações google, reputação online, restaurante, reviews, gestão de reputação, qr code, feedback, avalia pro"
        />
        <link rel="canonical" href="https://avaliapro.com.br" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Avalia Pro - A sua máquina de reviews 5 estrelas" />
        <meta property="og:description" content="Proteja a reputação do seu restaurante e dobre suas avaliações 5 estrelas em 30 dias." />
        <meta property="og:url" content="https://avaliapro.com.br" />
        <meta property="og:site_name" content="Avalia Pro" />
        <meta property="og:locale" content="pt_BR" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Avalia Pro - A sua máquina de reviews 5 estrelas" />
        <meta name="twitter:description" content="Proteja a reputação do seu restaurante e dobre suas avaliações 5 estrelas em 30 dias." />
        
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
            <section id="faq" aria-labelledby="faq-title">
              <FAQSection />
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
