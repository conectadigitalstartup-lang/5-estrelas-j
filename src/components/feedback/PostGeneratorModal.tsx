import { useState, useRef } from "react";
import { toPng } from "html-to-image";
import { Star, Download, Copy, Check, Shield } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import avaliaProShield from "@/assets/avalia-pro-shield.jpg";

interface PostGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedback: {
    comment: string | null;
    rating: number;
    client_name?: string | null;
    created_at?: string;
  };
  company: {
    name: string;
    logo_url: string | null;
  };
}

type TemplateType = "dark" | "light" | "vibrant" | "clean";

const PostGeneratorModal = ({
  open,
  onOpenChange,
  feedback,
  company,
}: PostGeneratorModalProps) => {
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);
  const [template, setTemplate] = useState<TemplateType>("dark");
  const [clientName, setClientName] = useState(
    feedback.client_name || "Cliente"
  );
  const [downloading, setDownloading] = useState(false);

  const feedbackText = feedback.comment || "Excelente experiência!";
  const feedbackDate = feedback.created_at 
    ? format(new Date(feedback.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    : format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

  // Truncate long text for the post
  const displayText =
    feedbackText.length > 180
      ? feedbackText.substring(0, 177) + "..."
      : feedbackText;

  // Format client name for display
  const formatClientName = (name: string) => {
    if (!name) return "Cliente";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  };

  const handleDownload = async () => {
    if (!previewRef.current) return;

    setDownloading(true);
    try {
      const dataUrl = await toPng(previewRef.current, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
      });

      const link = document.createElement("a");
      link.download = `post-${company.name.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = dataUrl;
      link.click();

      toast({ title: "Imagem baixada com sucesso!" });
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Erro ao gerar imagem",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
    setDownloading(false);
  };

  const handleCopyCaption = async () => {
    const caption = `"${feedbackText}" ⭐⭐⭐⭐⭐

Obrigado, ${formatClientName(clientName)}, pelo carinho! Feedbacks como esse nos motivam a continuar entregando o melhor.

📍 ${company.name}

#AvaliacaoReal #ClienteFeliz #Restaurante #Gastronomia #AvaliacaoVerificada`;

    try {
      await navigator.clipboard.writeText(caption);
      toast({ title: "Legenda copiada!" });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const templateStyles: Record<
    TemplateType,
    {
      background: string;
      textColor: string;
      nameColor: string;
      starColor: string;
      containerClass: string;
      dateColor: string;
      badgeBackground: string;
      badgeTextColor: string;
    }
  > = {
    dark: {
      background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
      textColor: "#FFFFFF",
      nameColor: "#D4AF37",
      starColor: "#D4AF37",
      containerClass: "",
      dateColor: "rgba(255,255,255,0.5)",
      badgeBackground: "rgba(255,255,255,0.1)",
      badgeTextColor: "rgba(255,255,255,0.7)",
    },
    light: {
      background: "#FAFAFA",
      textColor: "#1a1a1a",
      nameColor: "#666666",
      starColor: "#D4AF37",
      containerClass: "border-2 border-[#D4AF37]",
      dateColor: "rgba(0,0,0,0.4)",
      badgeBackground: "rgba(0,0,0,0.05)",
      badgeTextColor: "rgba(0,0,0,0.5)",
    },
    vibrant: {
      background: "linear-gradient(135deg, #FF6B35 0%, #F72585 100%)",
      textColor: "#FFFFFF",
      nameColor: "rgba(255,255,255,0.8)",
      starColor: "#FFFFFF",
      containerClass: "",
      dateColor: "rgba(255,255,255,0.6)",
      badgeBackground: "rgba(255,255,255,0.2)",
      badgeTextColor: "rgba(255,255,255,0.9)",
    },
    clean: {
      background: "#f5f5f5",
      textColor: "#111827",
      nameColor: "#4f46e5",
      starColor: "#D4AF37",
      containerClass: "",
      dateColor: "rgba(0,0,0,0.4)",
      badgeBackground: "rgba(79,70,229,0.1)",
      badgeTextColor: "#4f46e5",
    },
  };

  const currentStyle = templateStyles[template];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerar Post para Instagram</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          {/* Preview Area */}
          <div className="flex flex-col items-center">
            <p className="text-sm text-muted-foreground mb-3">Preview do Post</p>
            <div
              ref={previewRef}
              className={`w-[400px] h-[400px] relative overflow-hidden ${currentStyle.containerClass}`}
              style={{ background: currentStyle.background }}
            >
              {/* Date/Time at top right */}
              <div 
                className="absolute top-4 right-4 text-xs"
                style={{ color: currentStyle.dateColor }}
              >
                {feedbackDate}
              </div>

              {/* Stars at top */}
              <div className="absolute top-6 left-0 right-0 flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-6 h-6"
                    style={{ color: currentStyle.starColor, fill: currentStyle.starColor }}
                  />
                ))}
              </div>

              {/* Feedback text */}
              <div className="absolute inset-0 flex items-center justify-center px-8 pt-8">
                <div className="text-center">
                  <p
                    className="text-lg leading-relaxed font-serif"
                    style={{ color: currentStyle.textColor }}
                  >
                    "{displayText}"
                  </p>
                  <p
                    className="mt-4 text-sm font-medium"
                    style={{ color: currentStyle.nameColor }}
                  >
                    — {formatClientName(clientName)}
                  </p>
                </div>
              </div>

              {/* Avalia Pro verification badge at bottom left */}
              <div 
                className="absolute bottom-4 left-4 flex items-center gap-2 px-2 py-1 rounded-md"
                style={{ background: currentStyle.badgeBackground }}
              >
                <img 
                  src={avaliaProShield} 
                  alt="Avalia Pro" 
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span 
                  className="text-[9px] font-medium"
                  style={{ color: currentStyle.badgeTextColor }}
                >
                  Avaliação Verificada
                </span>
              </div>

              {/* Logo at bottom right */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                {company.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="h-10 w-auto object-contain"
                    style={{
                      opacity: template === "dark" ? 0.8 : 1,
                      filter: template === "vibrant" ? "brightness(0) invert(1)" : "none",
                    }}
                  />
                ) : (
                  <span
                    className="text-sm font-semibold"
                    style={{ color: currentStyle.nameColor }}
                  >
                    {company.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="space-y-6">
            {/* Template Selector */}
            <div className="space-y-3">
              <Label>Escolha o Template</Label>
              <RadioGroup
                value={template}
                onValueChange={(v) => setTemplate(v as TemplateType)}
                className="grid grid-cols-2 gap-3"
              >
                <div>
                  <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                  <Label
                    htmlFor="dark"
                    className="flex flex-col items-center gap-2 p-3 border rounded-lg cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className="w-12 h-12 rounded"
                      style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)" }}
                    />
                    <span className="text-xs">Elegante Escuro</span>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem value="light" id="light" className="peer sr-only" />
                  <Label
                    htmlFor="light"
                    className="flex flex-col items-center gap-2 p-3 border rounded-lg cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded bg-[#FAFAFA] border-2 border-[#D4AF37]" />
                    <span className="text-xs">Clean Claro</span>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem value="vibrant" id="vibrant" className="peer sr-only" />
                  <Label
                    htmlFor="vibrant"
                    className="flex flex-col items-center gap-2 p-3 border rounded-lg cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className="w-12 h-12 rounded"
                      style={{ background: "linear-gradient(135deg, #FF6B35 0%, #F72585 100%)" }}
                    />
                    <span className="text-xs">Vibrante</span>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem value="clean" id="clean" className="peer sr-only" />
                  <Label
                    htmlFor="clean"
                    className="flex flex-col items-center gap-2 p-3 border rounded-lg cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded bg-[#f5f5f5] flex items-center justify-center">
                      <Star className="w-5 h-5 text-[#4f46e5]" fill="#D4AF37" />
                    </div>
                    <span className="text-xs">Clean & Bright</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Feedback Text (readonly) */}
            <div className="space-y-2">
              <Label>Texto do Feedback</Label>
              <div className="p-3 bg-muted rounded-lg text-sm max-h-32 overflow-y-auto">
                {feedbackText}
              </div>
            </div>

            {/* Client Name */}
            <div className="space-y-2">
              <Label htmlFor="clientName">Nome do Cliente</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nome do cliente"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <Button
                size="lg"
                onClick={handleDownload}
                disabled={downloading}
                className="gap-2"
              >
                {downloading ? (
                  <>Gerando...</>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Baixar Imagem
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={handleCopyCaption}
                className="gap-2"
              >
                <Copy className="w-5 h-5" />
                Copiar Legenda
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostGeneratorModal;
