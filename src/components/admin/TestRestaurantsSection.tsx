import { useState, useEffect } from "react";
import { Plus, Trash2, QrCode, ExternalLink, Store } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

interface TestRestaurant {
  id: string;
  name: string;
  google_review_link: string | null;
  slug: string;
  created_at: string;
}

const MAX_RESTAURANTS = 10;

const generateSlug = (name: string): string => {
  const baseSlug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  
  return `test-${baseSlug}-${Date.now().toString(36)}`;
};

export function TestRestaurantsSection() {
  const { toast } = useToast();
  const [restaurants, setRestaurants] = useState<TestRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", googleLink: "" });
  const [saving, setSaving] = useState(false);

  const fetchRestaurants = async () => {
    const { data, error } = await supabase
      .from("admin_test_restaurants")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar restaurantes",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setRestaurants(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite o nome do restaurante.",
        variant: "destructive",
      });
      return;
    }

    if (restaurants.length >= MAX_RESTAURANTS) {
      toast({
        title: "Limite atingido",
        description: `Máximo de ${MAX_RESTAURANTS} restaurantes de teste.`,
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    const slug = generateSlug(formData.name);

    const { error } = await supabase.from("admin_test_restaurants").insert({
      name: formData.name.trim(),
      google_review_link: formData.googleLink.trim() || null,
      slug,
    });

    if (error) {
      toast({
        title: "Erro ao adicionar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Restaurante adicionado!",
        description: "O restaurante de teste foi criado com sucesso.",
      });
      setFormData({ name: "", googleLink: "" });
      setIsAddDialogOpen(false);
      fetchRestaurants();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from("admin_test_restaurants")
      .delete()
      .eq("id", deleteId);

    if (error) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Restaurante excluído",
        description: "O restaurante de teste foi removido.",
      });
      fetchRestaurants();
    }
    setDeleteId(null);
  };

  const getQRCodeUrl = (slug: string) => {
    return `${window.location.origin}/avaliar/${slug}`;
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Store className="h-5 w-5" />
            Restaurantes de Teste (CEO)
          </h2>
          <p className="text-sm text-muted-foreground">
            Cadastre até {MAX_RESTAURANTS} restaurantes para testes gratuitos
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {restaurants.length}/{MAX_RESTAURANTS}
        </Badge>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {restaurants.map((restaurant) => (
            <Card key={restaurant.id} className="shadow-elevated">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base font-medium">
                    {restaurant.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteId(restaurant.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {restaurant.google_review_link && (
                  <a
                    href={restaurant.google_review_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Link do Google
                  </a>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center p-4 bg-background rounded-lg border">
                  <QRCodeSVG
                    value={getQRCodeUrl(restaurant.slug)}
                    size={120}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground text-center break-all">
                    {getQRCodeUrl(restaurant.slug)}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        navigator.clipboard.writeText(getQRCodeUrl(restaurant.slug));
                        toast({ title: "Link copiado!" });
                      }}
                    >
                      Copiar Link
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => window.open(getQRCodeUrl(restaurant.slug), "_blank")}
                    >
                      <QrCode className="h-4 w-4 mr-1" />
                      Testar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add New Card */}
          {restaurants.length < MAX_RESTAURANTS && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Card className="shadow-elevated border-dashed cursor-pointer hover:border-primary/50 transition-colors flex items-center justify-center min-h-[280px]">
                  <CardContent className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Plus className="h-10 w-10" />
                    <p className="text-sm font-medium">Adicionar Restaurante</p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Restaurante de Teste</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Restaurante *</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Pizzaria Bella Napoli"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="googleLink">Link do Google (opcional)</Label>
                    <Input
                      id="googleLink"
                      placeholder="https://g.page/..."
                      value={formData.googleLink}
                      onChange={(e) =>
                        setFormData({ ...formData, googleLink: e.target.value })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Será usado para redirecionar avaliações positivas
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleAdd} disabled={saving}>
                    {saving ? "Salvando..." : "Adicionar"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir restaurante?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O restaurante de teste será
              removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
