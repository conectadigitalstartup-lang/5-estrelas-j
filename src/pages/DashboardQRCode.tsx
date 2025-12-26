// QR Code generation and download page
import { Helmet } from "react-helmet-async";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy, Printer, ExternalLink, Lightbulb, Check, Image } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { QRCodeCanvas } from "qrcode.react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import avaliaProLogo from "@/assets/avalia-pro-logo.jpg";

interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  google_review_link: string | null;
}

const DashboardQRCode = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("companies")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (data) {
        setCompany(data);
      }
      setLoading(false);
    };

    fetchCompany();
  }, [user]);

  const evaluationUrl = company ? `${window.location.origin}/avaliar/${company.slug}` : "";

  const copyLink = async () => {
    if (evaluationUrl) {
      await navigator.clipboard.writeText(evaluationUrl);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
    }
  };

  const downloadQRCodePNG = () => {
    setDownloading("png");
    const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `qrcode-${company?.slug || "avaliar"}.png`;
      link.href = url;
      link.click();
      toast({
        title: "Download concluído!",
        description: "Seu QR Code foi baixado em alta resolução.",
      });
    }
    setDownloading(null);
  };

  const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

  const generateQRCodeDataUrl = (): string => {
    // Create a temporary canvas to generate QR Code
    const tempCanvas = document.createElement("canvas");
    const size = 280; // High resolution
    tempCanvas.width = size;
    tempCanvas.height = size;
    
    // Use the existing visible QR Code canvas
    const existingCanvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement;
    if (existingCanvas) {
      const ctx = tempCanvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(existingCanvas, 0, 0, size, size);
        return tempCanvas.toDataURL("image/png");
      }
    }
    
    // Fallback: return empty white image
    const ctx = tempCanvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, size, size);
    }
    return tempCanvas.toDataURL("image/png");
  };

  const loadImageAsDataUrl = async (url: string): Promise<string | null> => {
    try {
      const response = await fetch(url, { mode: 'cors' });
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  const downloadMaterialPDF = async () => {
    setDownloading("pdf");
    
    try {
      // Generate QR Code data URL from the high-res hidden canvas
      const qrDataUrl = generateQRCodeDataUrl();
      
      // Load company logo or fallback to Avalia Pro logo
      let logoDataUrl: string | null = null;
      if (company?.logo_url) {
        logoDataUrl = await loadImageAsDataUrl(company.logo_url);
      }
      
      // If no company logo, use Avalia Pro logo
      if (!logoDataUrl) {
        logoDataUrl = await loadImageAsDataUrl(avaliaProLogo);
      }
      
      // Create premium PDF with professional design
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [100, 150], // Slightly taller for elegant proportions
      });

      const pageWidth = 100;
      const pageHeight = 150;
      const companyName = company?.name || "Seu Restaurante";

      // === PREMIUM BACKGROUND ===
      // Main dark navy background
      pdf.setFillColor(15, 23, 42); // Slate-900 - rich dark navy
      pdf.rect(0, 0, pageWidth, pageHeight, "F");

      // Subtle gradient overlay effect (lighter area at top)
      pdf.setFillColor(30, 41, 59); // Slate-800
      pdf.rect(0, 0, pageWidth, 50, "F");

      // Elegant gold accent line at top
      pdf.setFillColor(212, 175, 55); // Premium gold
      pdf.rect(0, 0, pageWidth, 3, "F");

      // === LOGO AREA ===
      if (logoDataUrl) {
        // Draw circular logo with gold border effect
        // Gold circle background
        pdf.setFillColor(212, 175, 55);
        pdf.circle(pageWidth / 2, 24, 14, "F");
        
        // Add the logo image (centered, circular appearance)
        pdf.addImage(logoDataUrl, "JPEG", pageWidth / 2 - 12, 12, 24, 24);
      } else {
        // Fallback to "A" emblem if image loading fails
        pdf.setFillColor(212, 175, 55);
        pdf.circle(pageWidth / 2, 22, 8, "F");
        pdf.setFillColor(15, 23, 42);
        pdf.circle(pageWidth / 2, 22, 6, "F");
        pdf.setTextColor(212, 175, 55);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("A", pageWidth / 2, 25, { align: "center" });
      }

      // === COMPANY NAME ===
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text(companyName, pageWidth / 2, 48, { align: "center" });

      // === MAIN MESSAGE ===
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.text("Sua opinião é importante para nós", pageWidth / 2, 58, { align: "center" });

      // === QR CODE CONTAINER ===
      // Outer white rounded rectangle with shadow effect
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(22, 66, 56, 56, 4, 4, "F");

      // QR Code
      pdf.addImage(qrDataUrl, "PNG", 25, 69, 50, 50);

      // === CALL TO ACTION ===
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text("Aponte a câmera para avaliar", pageWidth / 2, 132, { align: "center" });
      
      // Time indication - reduces friction
      pdf.setTextColor(180, 180, 190);
      pdf.setFontSize(8);
      pdf.text("Leva apenas 15 segundos", pageWidth / 2, 138, { align: "center" });

      // === FOOTER WITH BRANDING ===
      // Gold accent line at bottom
      pdf.setFillColor(212, 175, 55);
      pdf.rect(35, 144, 30, 0.5, "F");
      
      // Powered by text
      pdf.setTextColor(120, 120, 130);
      pdf.setFontSize(7);
      pdf.text("Powered by Avalia Pro", pageWidth / 2, 149, { align: "center" });

      pdf.save(`Avalia-Pro-Material-${company?.slug}.pdf`);
      
      toast({
        title: "Material premium gerado!",
        description: "Seu material de mesa profissional foi baixado.",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
    setDownloading(null);
  };

  const downloadA4PDF = async () => {
    setDownloading("a4");
    
    try {
      // Generate QR Code data URL from the high-res hidden canvas
      const qrDataUrl = generateQRCodeDataUrl();

      // Load company logo or fallback to Avalia Pro logo
      let logoDataUrl: string | null = null;
      if (company?.logo_url) {
        logoDataUrl = await loadImageAsDataUrl(company.logo_url);
      }
      
      // If no company logo, use Avalia Pro logo
      if (!logoDataUrl) {
        logoDataUrl = await loadImageAsDataUrl(avaliaProLogo);
      }

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const cardWidth = 90;
      const cardHeight = 135;
      const margin = 10;
      const gap = 5;
      const companyName = company?.name || "Seu Restaurante";

      // Helper function to draw a premium material card
      const drawPremiumCard = (x: number, y: number) => {
        // === PREMIUM BACKGROUND ===
        // Main dark navy background
        pdf.setFillColor(15, 23, 42);
        pdf.roundedRect(x, y, cardWidth, cardHeight, 4, 4, "F");

        // Subtle gradient overlay effect (lighter area at top)
        pdf.setFillColor(30, 41, 59);
        pdf.roundedRect(x, y, cardWidth, 45, 4, 4, "F");
        pdf.setFillColor(15, 23, 42);
        pdf.rect(x, y + 40, cardWidth, 5, "F"); // blend

        // Elegant gold accent line at top
        pdf.setFillColor(212, 175, 55);
        pdf.roundedRect(x, y, cardWidth, 2.5, 4, 4, "F");
        pdf.setFillColor(15, 23, 42);
        pdf.rect(x, y + 2, cardWidth, 2, "F");

        // === LOGO AREA ===
        if (logoDataUrl) {
          // Gold circle background for logo
          pdf.setFillColor(212, 175, 55);
          pdf.circle(x + cardWidth / 2, y + 20, 12, "F");
          
          // Add the logo image
          pdf.addImage(logoDataUrl, "JPEG", x + cardWidth / 2 - 10, y + 10, 20, 20);
        } else {
          // Fallback to "A" emblem
          pdf.setFillColor(212, 175, 55);
          pdf.circle(x + cardWidth / 2, y + 18, 7, "F");
          pdf.setFillColor(15, 23, 42);
          pdf.circle(x + cardWidth / 2, y + 18, 5, "F");
          pdf.setTextColor(212, 175, 55);
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "bold");
          pdf.text("A", x + cardWidth / 2, y + 20.5, { align: "center" });
        }

        // === COMPANY NAME ===
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text(companyName, x + cardWidth / 2, y + 38, { align: "center" });

        // === MAIN MESSAGE ===
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.text("Sua opinião é importante para nós", x + cardWidth / 2, y + 48, { align: "center" });

        // === QR CODE CONTAINER ===
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(x + 20, y + 54, 50, 50, 3, 3, "F");

        // QR Code
        pdf.addImage(qrDataUrl, "PNG", x + 22.5, y + 56.5, 45, 45);

        // === CALL TO ACTION ===
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.text("Aponte a câmera para avaliar", x + cardWidth / 2, y + 114, { align: "center" });
        
        // Time indication
        pdf.setTextColor(180, 180, 190);
        pdf.setFontSize(7);
        pdf.text("Leva apenas 15 segundos", x + cardWidth / 2, y + 120, { align: "center" });

        // === FOOTER WITH BRANDING ===
        // Gold accent line
        pdf.setFillColor(212, 175, 55);
        pdf.rect(x + 30, y + 126, 30, 0.4, "F");
        
        // Powered by text
        pdf.setTextColor(100, 100, 110);
        pdf.setFontSize(6);
        pdf.text("Powered by Avalia Pro", x + cardWidth / 2, y + 132, { align: "center" });
      };

      // Draw 4 premium cards in 2x2 grid
      drawPremiumCard(margin, margin);
      drawPremiumCard(margin + cardWidth + gap, margin);
      drawPremiumCard(margin, margin + cardHeight + gap);
      drawPremiumCard(margin + cardWidth + gap, margin + cardHeight + gap);

      pdf.save(`Avalia-Pro-Impressao-Premium-${company?.slug}.pdf`);
      
      toast({
        title: "PDF A4 Premium gerado!",
        description: "4 materiais profissionais prontos para impressão.",
      });
    } catch (error) {
      console.error("PDF A4 generation error:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
    setDownloading(null);
  };

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <>
      <Helmet>
        <title>Meu QR Code - Avalia Aí</title>
        <meta name="description" content="Gere e baixe seu QR Code personalizado para coletar avaliações." />
      </Helmet>

      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
            Seu QR Code Personalizado
          </h1>
          <p className="text-muted-foreground">
            Coloque nas mesas ou balcão para receber avaliações dos clientes.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* QR Code Preview */}
          <Card className="shadow-elevated">
            <CardHeader className="text-center">
              <CardTitle>Preview do Material</CardTitle>
              <CardDescription>
                É assim que seus clientes verão o QR Code
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {loading ? (
                <Skeleton className="w-72 h-[400px] rounded-3xl" />
              ) : (
                <div
                  id="material-preview"
                  className="relative overflow-hidden rounded-3xl text-center w-72 shadow-2xl"
                  style={{ background: 'linear-gradient(to bottom, #1e293b 0%, #0f172a 35%, #0f172a 100%)' }}
                >
                  {/* Gold accent line at top */}
                  <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400" />
                  
                  <div className="p-8">
                    {/* Premium gold emblem */}
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg">
                      <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center">
                        <span className="text-2xl font-bold bg-gradient-to-br from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                          A
                        </span>
                      </div>
                    </div>

                    {/* Company name */}
                    <h3 className="text-white font-display text-xl font-bold mb-2">
                      {company?.name || "Seu Restaurante"}
                    </h3>
                    
                    {/* Main message */}
                    <p className="text-white/80 text-sm mb-6">
                      Sua opinião é importante para nós
                    </p>
                    
                    {/* QR Code container */}
                    <div className="bg-white p-4 rounded-xl inline-block mb-6 shadow-lg">
                      <QRCodeCanvas
                        id="qr-code-material"
                        value={evaluationUrl}
                        size={140}
                        level="H"
                        includeMargin={false}
                        fgColor="#0f172a"
                        bgColor="#FFFFFF"
                      />
                    </div>
                    
                    {/* Call to action */}
                    <p className="text-white text-sm font-medium mb-1">
                      Aponte a câmera para avaliar
                    </p>
                    <p className="text-white/50 text-xs mb-6">
                      Leva apenas 15 segundos
                    </p>
                    
                    {/* Gold divider */}
                    <div className="w-16 h-0.5 mx-auto bg-gradient-to-r from-transparent via-amber-500 to-transparent mb-4" />
                    
                    {/* Footer */}
                    <p className="text-white/40 text-xs">
                      Powered by Avalia Pro
                    </p>
                  </div>
                </div>
              )}

              {/* Hidden high-res canvas for PNG download */}
              <div className="hidden">
                <QRCodeCanvas
                  id="qr-code-canvas"
                  value={evaluationUrl}
                  size={1024}
                  level="H"
                  includeMargin={true}
                  fgColor="#1A1A2E"
                  bgColor="#FFFFFF"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-6">
            {/* Link Section */}
            <Card>
              <CardHeader>
                <CardTitle>Link do seu formulário</CardTitle>
                <CardDescription>
                  Compartilhe esse link diretamente com seus clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    value={evaluationUrl}
                    readOnly
                    className="bg-muted font-mono text-sm"
                  />
                  <Button onClick={copyLink} variant="outline" disabled={!company}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                {evaluationUrl && (
                  <Button
                    variant="link"
                    asChild
                    className="mt-2 p-0 h-auto text-coral"
                  >
                    <a href={evaluationUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Testar página de avaliação
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Download Section */}
            <Card>
              <CardHeader>
                <CardTitle>Baixar Material</CardTitle>
                <CardDescription>
                  Escolha o formato ideal para você
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={downloadQRCodePNG}
                  variant="outline"
                  className="w-full justify-start"
                  disabled={!company || !!downloading}
                >
                  <Image className="w-4 h-4 mr-3" />
                  {downloading === "png" ? "Baixando..." : "Baixar QR Code (PNG)"}
                </Button>
                <Button
                  onClick={downloadMaterialPDF}
                  className="w-full justify-start bg-coral hover:bg-coral-dark"
                  disabled={!company || !!downloading}
                >
                  <Download className="w-4 h-4 mr-3" />
                  {downloading === "pdf" ? "Gerando PDF..." : "Baixar Material Completo (PDF)"}
                </Button>
                <Button
                  onClick={downloadA4PDF}
                  variant="outline"
                  className="w-full justify-start"
                  disabled={!company || !!downloading}
                >
                  <Printer className="w-4 h-4 mr-3" />
                  {downloading === "a4" ? "Gerando..." : "Baixar para Impressão A4 (4x)"}
                </Button>
              </CardContent>
            </Card>

            {/* Tips Section */}
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  Dicas para Melhores Resultados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[
                    "Coloque o QR Code em todas as mesas",
                    "Posicione próximo ao caixa para pagamento",
                    "Inclua no cardápio ou porta-guardanapos",
                    "Treine a equipe para mencionar a avaliação",
                    "O melhor momento é logo após o cliente pagar",
                  ].map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default DashboardQRCode;