import { Helmet } from "react-helmet-async";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy, QrCode, Printer, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

  const downloadQRCode = () => {
    // Using a QR code API to generate the image
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(evaluationUrl)}`;
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `qrcode-${company?.slug || "avaliar"}.png`;
    link.click();
    
    toast({
      title: "Download iniciado!",
      description: "Seu QR Code está sendo baixado.",
    });
  };

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
              <div className="bg-gradient-to-br from-primary to-navy-light p-8 rounded-2xl text-center max-w-sm">
                {company?.logo_url && (
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="w-20 h-20 mx-auto mb-4 rounded-xl object-cover bg-white"
                  />
                )}
                <h3 className="text-white font-display text-xl font-bold mb-2">
                  {company?.name || "Seu Restaurante"}
                </h3>
                <p className="text-white/80 text-sm mb-6">
                  Como foi sua experiência?
                </p>
                <div className="bg-white p-4 rounded-xl inline-block mb-4">
                  {evaluationUrl ? (
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(evaluationUrl)}`}
                      alt="QR Code"
                      className="w-40 h-40"
                    />
                  ) : (
                    <div className="w-40 h-40 bg-muted flex items-center justify-center">
                      <QrCode className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <p className="text-white/60 text-xs break-all">
                  {evaluationUrl || "Carregando..."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Baixar QR Code</CardTitle>
                <CardDescription>
                  Escolha o formato ideal para você
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={downloadQRCode}
                  className="w-full justify-start bg-coral hover:bg-coral-dark"
                  disabled={!company}
                >
                  <Download className="w-4 h-4 mr-3" />
                  Baixar QR Code (PNG)
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled={!company}
                >
                  <Printer className="w-4 h-4 mr-3" />
                  Baixar PDF para Impressão
                </Button>
                <Button
                  variant="outline"
                  onClick={copyLink}
                  className="w-full justify-start"
                  disabled={!company}
                >
                  <Copy className="w-4 h-4 mr-3" />
                  Copiar Link Direto
                </Button>
                {evaluationUrl && (
                  <Button
                    variant="ghost"
                    asChild
                    className="w-full justify-start text-muted-foreground"
                  >
                    <a href={evaluationUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-3" />
                      Testar Página de Avaliação
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dicas de Implementação</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="where">
                    <AccordionTrigger>Onde devo colocar o QR Code?</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Nas mesas do restaurante</li>
                        <li>No balcão de atendimento</li>
                        <li>No cardápio digital ou físico</li>
                        <li>Nos recibos ou comandas</li>
                        <li>Na entrada ou saída do estabelecimento</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="print">
                    <AccordionTrigger>Como imprimir?</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      Baixe o PDF e imprima em folha A4. Você pode recortar e plastificar 
                      para maior durabilidade. Recomendamos usar uma gráfica para impressão 
                      em material mais resistente.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="share">
                    <AccordionTrigger>Como compartilhar?</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      Você pode enviar o link direto por WhatsApp, Instagram, Email ou 
                      qualquer outra rede social. Basta copiar o link e compartilhar!
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default DashboardQRCode;