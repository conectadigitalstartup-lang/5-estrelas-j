import { useState, useRef, useCallback } from "react";
import { Upload, Trash2, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface LogoUploadProps {
  logoUrl: string;
  companyName: string;
  companyId: string | null;
  onLogoChange: (url: string) => void;
}

const LogoUpload = ({ logoUrl, companyName, companyId, onLogoChange }: LogoUploadProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!companyId) {
      toast({
        title: "Erro",
        description: "ID da empresa não encontrado.",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Formato inválido",
        description: "Use PNG, JPG ou WEBP.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O logo deve ter no máximo 2MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${companyId}-logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("logos")
        .getPublicUrl(fileName);

      // Add cache buster to force reload
      const urlWithCacheBuster = `${publicUrl}?t=${Date.now()}`;
      onLogoChange(urlWithCacheBuster);

      toast({
        title: "Logo enviado!",
        description: "Não esqueça de salvar as alterações.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar o logo.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }, [companyId, onLogoChange, toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const removeLogo = () => {
    onLogoChange("");
    toast({
      title: "Logo removido",
      description: "Não esqueça de salvar as alterações.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-6">
        {/* Preview Area */}
        <div
          className={cn(
            "relative w-32 h-32 rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden flex items-center justify-center cursor-pointer group",
            isDragging 
              ? "border-primary bg-primary/10 scale-105" 
              : logoUrl 
                ? "border-transparent bg-muted/50" 
                : "border-muted-foreground/30 bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : logoUrl ? (
            <>
              <img 
                src={logoUrl} 
                alt={companyName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Upload className="w-6 h-6 text-white" />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <ImageIcon className="w-7 h-7 text-primary" />
              </div>
              <span className="text-xs text-center px-2">
                {isDragging ? "Solte aqui" : "Arraste ou clique"}
              </span>
            </div>
          )}
        </div>

        {/* Info and Actions */}
        <div className="flex-1 space-y-3 pt-1">
          <div>
            <h4 className="font-medium text-foreground">Logo do Restaurante</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Será exibido na página de avaliação e materiais de marketing.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              {logoUrl ? "Alterar" : "Enviar"} Logo
            </Button>

            {logoUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeLogo}
                disabled={uploading}
                className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
                Remover
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            PNG, JPG ou WEBP • Máximo 2MB
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
};

export default LogoUpload;
