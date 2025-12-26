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

  const downloadMaterialPDF = async () => {
    setDownloading("pdf");
    
    try {
      // Generate QR Code data URL from the high-res hidden canvas
      const qrDataUrl = generateQRCodeDataUrl();
      
      // Create PDF directly with jsPDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [100, 140],
      });

      // Draw background gradient (approximated as solid color)
      pdf.setFillColor(26, 54, 93); // #1a365d
      pdf.roundedRect(0, 0, 100, 140, 5, 5, "F");

      // Add company name
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      const companyName = company?.name || "Seu Restaurante";
      pdf.text(companyName, 50, 30, { align: "center" });

      // Add subtitle
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text("Como foi sua experiência?", 50, 40, { align: "center" });

      // Add white background for QR Code
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(25, 48, 50, 50, 3, 3, "F");

      // Add QR Code image
      pdf.addImage(qrDataUrl, "PNG", 27, 50, 46, 46);

      // Add call to action
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.text("Escaneie e avalie agora", 50, 108, { align: "center" });

      // Add stars
      pdf.setTextColor(251, 191, 36); // amber
      pdf.setFontSize(14);
      pdf.text("★ ★ ★ ★ ★", 50, 118, { align: "center" });

      // Add footer
      pdf.setTextColor(255, 255, 255, 0.5);
      pdf.setFontSize(8);
      pdf.text("Powered by Avalia Pro", 50, 132, { align: "center" });

      pdf.save(`Avalia-Pro-Material-${company?.slug}.pdf`);
      
      toast({
        title: "PDF gerado!",
        description: "O material de mesa foi baixado.",
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

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const width = 90;
      const height = 126;
      const margin = 10;
      const gap = 5;
      const companyName = company?.name || "Seu Restaurante";

      // Helper function to draw a single material card
      const drawCard = (x: number, y: number) => {
        // Background
        pdf.setFillColor(26, 54, 93);
        pdf.roundedRect(x, y, width, height, 4, 4, "F");

        // Company name
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text(companyName, x + width / 2, y + 20, { align: "center" });

        // Subtitle
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.text("Como foi sua experiência?", x + width / 2, y + 28, { align: "center" });

        // White background for QR
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(x + 20, y + 34, 50, 50, 2, 2, "F");

        // QR Code
        pdf.addImage(qrDataUrl, "PNG", x + 22, y + 36, 46, 46);

        // Call to action
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(9);
        pdf.text("Escaneie e avalie agora", x + width / 2, y + 94, { align: "center" });

        // Stars
        pdf.setTextColor(251, 191, 36);
        pdf.setFontSize(12);
        pdf.text("★ ★ ★ ★ ★", x + width / 2, y + 104, { align: "center" });

        // Footer
        pdf.setTextColor(180, 180, 200);
        pdf.setFontSize(7);
        pdf.text("Powered by Avalia Pro", x + width / 2, y + 118, { align: "center" });
      };

      // Draw 4 cards in 2x2 grid
      drawCard(margin, margin);
      drawCard(margin + width + gap, margin);
      drawCard(margin, margin + height + gap);
      drawCard(margin + width + gap, margin + height + gap);

      pdf.save(`Avalia-Pro-Impressao-${company?.slug}.pdf`);
      
      toast({
        title: "PDF A4 gerado!",
        description: "4 materiais prontos para impressão.",
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
                <Skeleton className="w-72 h-96 rounded-3xl" />
              ) : (
                <div
                  id="material-preview"
                  className="bg-gradient-to-br from-primary to-navy-light p-8 rounded-3xl text-center w-72 shadow-2xl"
                >
                  {company?.logo_url ? (
                    <img
                      src={company.logo_url}
                      alt={company.name}
                      crossOrigin="anonymous"
                      className="w-20 h-20 mx-auto mb-4 rounded-xl object-cover bg-white"
                    />
                  ) : (
                    <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-coral flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {getInitial(company?.name || "R")}
                      </span>
                    </div>
                  )}
                  <h3 className="text-white font-display text-xl font-bold mb-2">
                    {company?.name || "Seu Restaurante"}
                  </h3>
                  <p className="text-white/80 text-sm mb-4">
                    Como foi sua experiência?
                  </p>
                  <div className="bg-white p-4 rounded-xl inline-block mb-4">
                    <QRCodeCanvas
                      id="qr-code-material"
                      value={evaluationUrl}
                      size={140}
                      level="H"
                      includeMargin={false}
                      fgColor="#1A1A2E"
                      bgColor="#FFFFFF"
                    />
                  </div>
                  <p className="text-white/90 text-sm font-medium mb-2">
                    Escaneie e avalie agora
                  </p>
                  <div className="flex justify-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-amber-400 text-lg">★</span>
                    ))}
                  </div>
                  <p className="text-white/50 text-xs">
                    Powered by Avalia Pro
                  </p>
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