import { useState, useCallback, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  Camera,
  Upload,
  Download,
  RefreshCw,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  Smartphone,
  Rocket,
  Instagram,
  Clock,
  Sparkles,
  AlertCircle,
  Crown,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";

interface BackgroundOption {
  id: string;
  label: string;
  preview: string;
  type: "color" | "texture" | "transparent";
}

interface UsageInfo {
  used: number;
  limit: number;
  remaining: number;
  plan: string;
  isSuperAdmin: boolean;
}

const backgroundOptions: BackgroundOption[] = [
  { id: "transparent", label: "Fundo Removido", preview: "🔲", type: "transparent" },
  { id: "white", label: "Branco Limpo", preview: "#FFFFFF", type: "color" },
  { id: "gray", label: "Cinza Elegante", preview: "#F0F0F0", type: "color" },
  { id: "wood_light", label: "Madeira Rústica", preview: "🪵", type: "texture" },
  { id: "marble", label: "Mármore Claro", preview: "⬜", type: "texture" },
  { id: "wood_dark", label: "Mesa Escura", preview: "🟫", type: "texture" },
];

const loadingMessages = [
  "Ajustando a iluminação... ☀️",
  "Removendo a bagunça do fundo... 🧹",
  "Deixando tudo mais apetitoso... 🤤",
  "Quase pronto, caprichando nos detalhes... 💎",
];

const benefits = [
  {
    icon: Smartphone,
    title: "Sem equipamento caro",
    description: "Use apenas seu celular. A IA faz o trabalho de um fotógrafo profissional.",
  },
  {
    icon: Rocket,
    title: "Venda mais no iFood",
    description: "Fotos bonitas aumentam em até 30% os pedidos. Destaque-se da concorrência.",
  },
  {
    icon: Instagram,
    title: "Instagram de dar inveja",
    description: "Crie um feed profissional que atrai seguidores e clientes.",
  },
  {
    icon: Clock,
    title: "Pronto em 5 segundos",
    description: "Economize horas de edição. Foque no que importa: cozinhar.",
  },
];

const DashboardFoodPhotos = () => {
  const { toast } = useToast();
  const { plan } = useSubscription();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<string>("transparent");
  const [processing, setProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(true);

  // Fetch usage info on mount
  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("enhance-food-photo", {
          body: { checkOnly: true },
        });

        if (!error && data) {
          setUsage(data);
        }
      } catch (err) {
        console.error("Error fetching usage:", err);
      } finally {
        setLoadingUsage(false);
      }
    };

    fetchUsage();
  }, []);

  // Rotate loading messages
  useEffect(() => {
    if (!processing) return;
    
    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [processing]);

  const handleFileSelect = useCallback((file: File) => {
    // Validate file
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem (JPG ou PNG).",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo é 10MB.",
        variant: "destructive",
      });
      return;
    }

    setOriginalFile(file);
    setResultImage(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleApplyMagic = async () => {
    if (!originalImage) return;

    // Check limit before processing
    if (usage && usage.limit !== -1 && usage.remaining <= 0) {
      toast({
        title: "Limite atingido",
        description: `Você usou todas as ${usage.limit} fotos do seu plano. Faça upgrade para continuar!`,
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    setLoadingMessageIndex(0);
    setResultImage(null);

    try {
      const { data, error } = await supabase.functions.invoke("enhance-food-photo", {
        body: {
          imageBase64: originalImage,
          backgroundChoice: selectedBackground,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.limitReached) {
        setUsage(prev => prev ? { ...prev, remaining: 0 } : null);
        toast({
          title: "Limite atingido",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.enhancedImageUrl) {
        setResultImage(data.enhancedImageUrl);
        // Update usage after successful processing
        if (data.used !== undefined && data.limit !== undefined) {
          setUsage(prev => prev ? {
            ...prev,
            used: data.used,
            remaining: data.remaining,
          } : null);
        }
        toast({
          title: "Foto processada! ✨",
          description: `Sua foto profissional está pronta. ${data.remaining !== -1 ? `Restam ${data.remaining} fotos este mês.` : ''}`,
        });
      }
    } catch (err) {
      console.error("Error enhancing photo:", err);
      toast({
        title: "Erro ao processar",
        description: err instanceof Error ? err.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!resultImage) return;

    try {
      // Convert base64 to blob
      const response = await fetch(resultImage);
      const blob = await response.blob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `foto-profissional-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Download iniciado!",
        description: "Sua foto está sendo baixada.",
      });
    } catch {
      toast({
        title: "Erro no download",
        description: "Tente clicar com o botão direito e salvar a imagem.",
        variant: "destructive",
      });
    }
  };

  const handleTryAnotherBackground = () => {
    setResultImage(null);
  };

  const handleChangeImage = () => {
    setOriginalImage(null);
    setOriginalFile(null);
    setResultImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <Helmet>
        <title>Paparazzi de Comida - Avalia Pro</title>
        <meta name="description" content="Transforme fotos do celular em imagens profissionais em segundos." />
      </Helmet>

      <DashboardLayout>
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2 flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-primary" />
                Paparazzi de Comida
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Transforme fotos do celular em imagens profissionais em 5 segundos. Perfeitas para Instagram, iFood e cardápio.
              </p>
            </div>

            {/* Usage Card */}
            {!loadingUsage && usage && (
              <Card className="sm:min-w-[220px]">
                <CardContent className="p-4">
                  {usage.limit === -1 ? (
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-amber-500" />
                      <span className="text-sm font-medium">Uso ilimitado</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Fotos este mês</span>
                        <Badge variant={usage.remaining > 0 ? "secondary" : "destructive"}>
                          {usage.used}/{usage.limit}
                        </Badge>
                      </div>
                      <Progress 
                        value={(usage.used / usage.limit) * 100} 
                        className={cn("h-2", usage.remaining === 0 && "bg-destructive/20")}
                      />
                      {usage.remaining === 0 ? (
                        <div className="flex items-center gap-1 text-xs text-destructive">
                          <AlertCircle className="w-3 h-3" />
                          Limite atingido
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Restam <strong>{usage.remaining}</strong> fotos
                        </p>
                      )}
                      {usage.plan === "basico" && (
                        <Button asChild size="sm" variant="outline" className="w-full mt-2">
                          <Link to="/dashboard/upgrade">
                            <Crown className="w-3 h-3 mr-1" />
                            Upgrade para 40/mês
                          </Link>
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Limit Reached Warning */}
        {usage && usage.limit !== -1 && usage.remaining === 0 && (
          <Card className="mb-6 border-destructive/50 bg-destructive/5">
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Limite de fotos atingido</p>
                  <p className="text-sm text-muted-foreground">
                    Você usou todas as {usage.limit} fotos do plano {usage.plan === "pro" ? "Pro" : "Básico"} este mês.
                  </p>
                </div>
              </div>
              <Button asChild>
                <Link to="/dashboard/upgrade">
                  <Crown className="w-4 h-4 mr-2" />
                  Fazer Upgrade
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          {/* Left Column: Upload & Controls */}
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Upload Zone */}
              {!originalImage ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Camera className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-lg font-medium text-foreground mb-1">
                    Clique para enviar a foto do seu prato
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Formatos aceitos: JPG, PNG. Tamanho máximo: 10MB.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden bg-muted aspect-square">
                    <img
                      src={originalImage}
                      alt="Foto original"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleChangeImage}
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Trocar Imagem
                  </Button>
                </div>
              )}

              {/* Background Selector */}
              <div className="space-y-3">
                <h3 className="font-medium text-foreground">Escolha o fundo da sua foto:</h3>
                <div className="grid grid-cols-3 gap-3">
                  {backgroundOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedBackground(option.id)}
                      className={cn(
                        "p-3 rounded-lg border-2 transition-all text-center",
                        selectedBackground === option.id
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-muted-foreground/50"
                      )}
                    >
                      <div
                        className={cn(
                          "w-12 h-12 rounded-lg mx-auto mb-2 flex items-center justify-center text-2xl",
                          option.type === "color" && option.id === "white" && "bg-white border",
                          option.type === "color" && option.id === "gray" && "bg-gray-200",
                          option.type === "transparent" && "bg-[repeating-conic-gradient(#ccc_0%_25%,#fff_0%_50%)] bg-[length:16px_16px]"
                        )}
                        style={
                          option.type === "texture"
                            ? { backgroundColor: option.id === "wood_light" ? "#DEB887" : option.id === "marble" ? "#F5F5F5" : "#4A3728" }
                            : undefined
                        }
                      >
                        {option.type === "transparent" && "🔲"}
                        {option.type === "texture" && (option.id === "wood_light" ? "🪵" : option.id === "marble" ? "⬜" : "🟤")}
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              {usage && usage.limit !== -1 && usage.remaining === 0 ? (
                <Button
                  size="lg"
                  asChild
                  className="w-full"
                >
                  <Link to="/dashboard/upgrade">
                    <Crown className="w-5 h-5 mr-2" />
                    Fazer Upgrade para Continuar
                  </Link>
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={handleApplyMagic}
                  disabled={!originalImage || processing || (usage && usage.limit !== -1 && usage.remaining <= 0)}
                  className="w-full bg-gradient-to-r from-primary to-coral hover:from-primary/90 hover:to-coral/90 text-white"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Aplicar Mágica!
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Right Column: Result */}
          <Card>
            <CardContent className="p-6 h-full flex flex-col">
              {!resultImage && !processing ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-muted/50 rounded-xl">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-center">
                    Sua foto profissional aparecerá aqui.
                  </p>
                </div>
              ) : processing ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-muted/50 rounded-xl">
                  <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                  <p className="text-foreground font-medium text-center animate-pulse">
                    {loadingMessages[loadingMessageIndex]}
                  </p>
                </div>
              ) : resultImage ? (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden bg-muted aspect-square">
                    <img
                      src={resultImage}
                      alt="Foto processada"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Pronta!
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      size="lg"
                      onClick={handleDownload}
                      className="flex-1 bg-gradient-to-r from-primary to-coral hover:from-primary/90 hover:to-coral/90"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Baixar Foto em Alta Resolução
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleTryAnotherBackground}
                    >
                      <RefreshCw className="w-5 h-5 mr-2" />
                      Outro Fundo
                    </Button>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="mb-8">
          <h2 className="text-xl font-display font-bold text-foreground mb-6">
            Por que o Paparazzi de Comida é essencial para o seu negócio?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {benefits.map((benefit, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default DashboardFoodPhotos;
