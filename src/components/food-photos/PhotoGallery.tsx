import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Download,
  Trash2,
  Image as ImageIcon,
  Loader2,
  X,
  ZoomIn,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface EnhancedPhoto {
  id: string;
  storage_path: string;
  background_choice: string | null;
  created_at: string;
  url: string;
}

const backgroundLabels: Record<string, string> = {
  transparent: "Fundo Removido",
  white: "Branco",
  gray: "Cinza",
  wood_light: "Madeira Clara",
  marble: "Mármore",
  wood_dark: "Madeira Escura",
  default: "Padrão",
};

const PhotoGallery = () => {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<EnhancedPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<EnhancedPhoto | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from("enhanced_photos")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Get public URLs for each photo
      const photosWithUrls = (data || []).map((photo: any) => {
        const { data: urlData } = supabase.storage
          .from("enhanced-photos")
          .getPublicUrl(photo.storage_path);
        
        return {
          ...photo,
          url: urlData.publicUrl,
        };
      });

      setPhotos(photosWithUrls);
    } catch (err) {
      console.error("Error fetching photos:", err);
      toast({
        title: "Erro ao carregar fotos",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleDownload = async (photo: EnhancedPhoto) => {
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `foto-profissional-${format(new Date(photo.created_at), "yyyy-MM-dd-HHmm")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Download iniciado!",
      });
    } catch {
      toast({
        title: "Erro no download",
        description: "Tente clicar com o botão direito e salvar a imagem.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    const photoToDelete = photos.find(p => p.id === deleteId);

    try {
      // Delete from storage
      if (photoToDelete) {
        await supabase.storage
          .from("enhanced-photos")
          .remove([photoToDelete.storage_path]);
      }

      // Delete from database
      const { error } = await supabase
        .from("enhanced_photos")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      // Update local state
      setPhotos(prev => prev.filter(p => p.id !== deleteId));
      
      toast({
        title: "Foto excluída",
      });
    } catch (err) {
      console.error("Error deleting photo:", err);
      toast({
        title: "Erro ao excluir",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Suas Fotos Salvas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (photos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Suas Fotos Salvas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              Suas fotos processadas aparecerão aqui.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Use a ferramenta acima para começar!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Suas Fotos Salvas ({photos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={photo.url}
                  alt="Foto processada"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <ZoomIn className="w-8 h-8 text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-white text-xs truncate">
                    {format(new Date(photo.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Photo Preview Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
          {selectedPhoto && (
            <div>
              <div className="relative bg-black">
                <img
                  src={selectedPhoto.url}
                  alt="Foto processada"
                  className="w-full max-h-[70vh] object-contain"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-white hover:bg-white/20"
                  onClick={() => setSelectedPhoto(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-background">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedPhoto.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Fundo: {backgroundLabels[selectedPhoto.background_choice || "default"] || selectedPhoto.background_choice}
                  </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    onClick={() => handleDownload(selectedPhoto)}
                    className="flex-1 sm:flex-none"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setDeleteId(selectedPhoto.id);
                      setSelectedPhoto(null);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => !deleting && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir foto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A foto será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PhotoGallery;
