import { useState, useCallback } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StepTwoProps {
  logoUrl: string | null;
  onChange: (logoUrl: string | null) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepTwo = ({ logoUrl, onChange, onNext, onBack }: StepTwoProps) => {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!user) return;

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Formato inválido. Use PNG, JPG ou WEBP.");
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 2MB.");
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("logos")
        .getPublicUrl(fileName);

      onChange(urlData.publicUrl);
      toast.success("Logo enviado com sucesso!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erro ao enviar logo. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  }, [user, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const removeLogo = useCallback(() => {
    onChange(null);
  }, [onChange]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-foreground">
          Personalize sua página 🎨
        </h2>
        <p className="text-muted-foreground mt-1">
          Adicione o logo do seu restaurante
        </p>
      </div>

      {logoUrl ? (
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <img
              src={logoUrl}
              alt="Logo preview"
              className="w-32 h-32 rounded-full object-cover border-4 border-gold/20"
            />
            <button
              onClick={removeLogo}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            Seu logo ficará assim na página de avaliação
          </p>
        </div>
      ) : (
        <label
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200",
            isDragging
              ? "border-gold bg-gold/5"
              : "border-border bg-muted/30 hover:border-gold/50 hover:bg-muted/50"
          )}
        >
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleInputChange}
            className="hidden"
            disabled={isUploading}
          />
          
          {isUploading ? (
            <Loader2 className="w-12 h-12 text-gold animate-spin" />
          ) : (
            <Upload className="w-12 h-12 text-muted-foreground" />
          )}
          
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {isUploading ? "Enviando..." : "Arraste uma imagem ou clique para selecionar"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG ou WEBP até 2MB
            </p>
          </div>
        </label>
      )}

      <div className="flex gap-3">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1"
          size="lg"
        >
          Voltar
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 bg-gold hover:bg-gold/90 text-primary"
          size="lg"
        >
          {logoUrl ? "Próximo" : "Pular"}
        </Button>
      </div>
    </div>
  );
};

export default StepTwo;
