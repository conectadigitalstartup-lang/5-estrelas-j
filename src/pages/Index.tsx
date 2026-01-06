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
const FeedbackSection = lazy(() => import("@/components/landing/FeedbackSection"));
const CTASection = lazy(() => import("@/components/landing/CTASection"));

const schemaData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Avalia Pro",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "Plataforma de gestão de feedback e reputação online para restaurantes. Centralize avaliações, organize feedbacks e fortaleça sua presença online.",
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
        <title>Avalia Pro — Gestão de Feedback para Restaurantes</title>
        <meta
          name="description"
          content="Software B2B para centralizar feedback de clientes, organizar avaliações e fortalecer a reputação online do seu estabelecimento. Teste grátis por 7 dias."
        />
        <meta
          name="keywords"
          content="gestão de feedback, reputação online, restaurante, avaliações, gestão de reputação, qr code, feedback, avalia pro, software b2b"
        />
        <link rel="canonical" href="https://avaliapro.online" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Avalia Pro — Gestão de Feedback para Restaurantes" />
        <meta property="og:description" content="Software B2B para centralizar feedback de clientes, organizar avaliações e fortalecer a reputação online." />
        <meta property="og:url" content="https://avaliapro.online" />
        <meta property="og:site_name" content="Avalia Pro" />
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:image" content="https://avaliapro.online/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Avalia Pro — Gestão de Feedback para Restaurantes" />
        <meta name="twitter:description" content="Software B2B para centralizar feedback de clientes e fortalecer sua reputação online." />
        <meta name="twitter:image" content="https://avaliapro.online/og-image.png" />
        
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
            <FeedbackSection />
            <CTASection />
          </Suspense>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
