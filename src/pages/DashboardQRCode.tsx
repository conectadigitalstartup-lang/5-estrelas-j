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

  const waitForImages = (element: HTMLElement): Promise<void> => {
    const images = element.querySelectorAll("img");
    const promises = Array.from(images).map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    });
    return Promise.all(promises).then(() => {});
  };

  const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

  // Convert QR Code canvas to inline image for reliable PDF capture
  const convertQRCodeToImage = async (element: HTMLElement): Promise<void> => {
    const qrCanvas = element.querySelector("#qr-code-material") as HTMLCanvasElement;
    if (qrCanvas) {
      const dataUrl = qrCanvas.toDataURL("image/png");
      const img = document.createElement("img");
      img.src = dataUrl;
      img.style.width = "140px";
      img.style.height = "140px";
      qrCanvas.parentNode?.replaceChild(img, qrCanvas);
      // Wait for image to load
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        setTimeout(resolve, 100); // Fallback
      });
    }
  };

  const downloadMaterialPDF = async () => {
    setDownloading("pdf");
    const element = document.getElementById("material-preview");
    if (!element) {
      setDownloading(null);
      return;
    }

    try {
      // Clone the element to avoid modifying the original
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.position = "absolute";
      clone.style.left = "-9999px";
      document.body.appendChild(clone);

      // Wait for all images to load
      await waitForImages(clone);

      // Convert QR Code canvas to image
      await convertQRCodeToImage(clone);

      // Extended delay to ensure complete render
      await delay(1000);
      
      const canvas = await html2canvas(clone, { 
        scale: 3, 
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      // Remove clone
      document.body.removeChild(clone);

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [100, 140],
      });

      pdf.addImage(imgData, "PNG", 0, 0, 100, 140);
      pdf.save(`material-mesa-${company?.slug}.pdf`);
      
      toast({
        title: "PDF gerado!",
        description: "O material de mesa foi baixado.",
      });
    } catch (error) {
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
    const element = document.getElementById("material-preview");
    if (!element) {
      setDownloading(null);
      return;
    }

    try {
      // Clone the element to avoid modifying the original
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.position = "absolute";
      clone.style.left = "-9999px";
      document.body.appendChild(clone);

      // Wait for all images to load
      await waitForImages(clone);

      // Convert QR Code canvas to image
      await convertQRCodeToImage(clone);

      // Extended delay to ensure complete render
      await delay(1000);
      
      const canvas = await html2canvas(clone, { 
        scale: 3, 
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      // Remove clone
      document.body.removeChild(clone);

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const width = 90;
      const height = 126;
      const margin = 10;

      // 4 materiais em grid 2x2
      pdf.addImage(imgData, "PNG", margin, margin, width, height);
      pdf.addImage(imgData, "PNG", margin + width + 5, margin, width, height);
      pdf.addImage(imgData, "PNG", margin, margin + height + 5, width, height);
      pdf.addImage(imgData, "PNG", margin + width + 5, margin + height + 5, width, height);

      pdf.save(`material-impressao-${company?.slug}.pdf`);
      
      toast({
        title: "PDF A4 gerado!",
        description: "4 materiais prontos para impressão.",
      });
    } catch (error) {
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