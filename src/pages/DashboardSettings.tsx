import { Helmet } from "react-helmet-async";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Building2, User, CreditCard, Trash2, Save, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const DashboardSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [companyData, setCompanyData] = useState({
    name: "",
    restaurant_type: "",
    google_review_link: "",
    slug: "",
  });
  const [profileData, setProfileData] = useState({
    restaurant_name: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch company
      const { data: company } = await supabase
        .from("companies")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (company) {
        setCompanyData({
          name: company.name || "",
          restaurant_type: company.restaurant_type || "",
          google_review_link: company.google_review_link || "",
          slug: company.slug || "",
        });
      }

      // Fetch profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("restaurant_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile) {
        setProfileData({
          restaurant_name: profile.restaurant_name || "",
        });
      }
    };

    fetchData();
  }, [user]);

  const handleSaveCompany = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("companies")
        .update({
          name: companyData.name,
          restaurant_type: companyData.restaurant_type,
          google_review_link: companyData.google_review_link,
        })
        .eq("owner_id", user.id);

      if (error) throw error;

      toast({
        title: "Alterações salvas!",
        description: "As informações da empresa foram atualizadas.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Configurações - Avalia Aí</title>
        <meta name="description" content="Configure as informações do seu restaurante e conta." />
      </Helmet>

      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
            Configurações
          </h1>
          <p className="text-muted-foreground">
            Gerencie as informações do seu restaurante e conta.
          </p>
        </div>

        <div className="max-w-2xl space-y-6">
          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-coral" />
                Informações da Empresa
              </CardTitle>
              <CardDescription>
                Dados que aparecem na página de avaliação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="company-name">Nome do Restaurante</Label>
                <Input
                  id="company-name"
                  value={companyData.name}
                  onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                  placeholder="Nome do seu restaurante"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="restaurant-type">Tipo de Estabelecimento</Label>
                <Input
                  id="restaurant-type"
                  value={companyData.restaurant_type}
                  onChange={(e) => setCompanyData({ ...companyData, restaurant_type: e.target.value })}
                  placeholder="Ex: Restaurante, Bar, Pizzaria..."
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="google-link">Link do Google Reviews</Label>
                <Input
                  id="google-link"
                  value={companyData.google_review_link}
                  onChange={(e) => setCompanyData({ ...companyData, google_review_link: e.target.value })}
                  placeholder="https://maps.google.com/..."
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="slug">URL da Página de Avaliação</Label>
                <Input
                  id="slug"
                  value={`/avaliar/${companyData.slug}`}
                  disabled
                  className="bg-muted"
                />
              </div>

              <Button onClick={handleSaveCompany} disabled={loading} className="bg-coral hover:bg-coral-dark">
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salvar alterações
              </Button>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-coral" />
                Informações da Conta
              </CardTitle>
              <CardDescription>
                Dados do seu perfil de usuário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>

              <Button variant="outline">
                Alterar senha
              </Button>
            </CardContent>
          </Card>

          {/* Billing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-coral" />
                Cobrança
              </CardTitle>
              <CardDescription>
                Gerencie sua assinatura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-coral/10 border border-coral/20">
                <p className="font-medium text-foreground">Período de Trial</p>
                <p className="text-sm text-muted-foreground">
                  Você está no período de teste gratuito de 14 dias.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="w-5 h-5" />
                Zona de Perigo
              </CardTitle>
              <CardDescription>
                Ações irreversíveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    Deletar todos os dados
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Todos os seus dados, incluindo
                      feedbacks e configurações, serão permanentemente removidos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Sim, deletar tudo
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
};

export default DashboardSettings;