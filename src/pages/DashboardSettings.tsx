import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PlaceSearch from "@/components/onboarding/PlaceSearch";
import { 
  Building2, 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Trash2, 
  Save, 
  Loader2,
  ExternalLink,
  Eye,
  EyeOff,
  Upload,
  MapPin,
  Star,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  google_maps_url: string;
  rating?: number | null;
  user_ratings_total?: number | null;
}

interface NotificationPrefs {
  email_notifications: boolean;
  weekly_summary: boolean;
  negative_alerts: boolean;
  marketing_emails: boolean;
}

const DashboardSettings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyData, setCompanyData] = useState({
    name: "",
    restaurant_type: "",
    google_review_link: "",
    slug: "",
    logo_url: "",
    google_place_id: "",
    initial_google_rating: null as number | null,
    initial_google_ratings_total: null as number | null,
    current_google_rating: null as number | null,
    current_google_ratings_total: null as number | null,
  });
  
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [savingGoogle, setSavingGoogle] = useState(false);
  const [showGoogleSearch, setShowGoogleSearch] = useState(false);
  
  const [profileData, setProfileData] = useState({
    full_name: "",
    phone: "",
  });

  const [notifications, setNotifications] = useState<NotificationPrefs>({
    email_notifications: true,
    weekly_summary: true,
    negative_alerts: true,
    marketing_emails: false,
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);

      const { data: company } = await supabase
        .from("companies")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (company) {
        setCompanyId(company.id);
        setCompanyData({
          name: company.name || "",
          restaurant_type: company.restaurant_type || "",
          google_review_link: company.google_review_link || "",
          slug: company.slug || "",
          logo_url: company.logo_url || "",
          google_place_id: company.google_place_id || "",
          initial_google_rating: company.initial_google_rating,
          initial_google_ratings_total: company.initial_google_ratings_total,
          current_google_rating: company.current_google_rating,
          current_google_ratings_total: company.current_google_ratings_total,
        });
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile) {
        setProfileData({
          full_name: profile.full_name || user.user_metadata?.full_name || "",
          phone: profile.phone || "",
        });
        setNotifications({
          email_notifications: profile.email_notifications ?? true,
          weekly_summary: profile.weekly_summary ?? true,
          negative_alerts: profile.negative_alerts ?? true,
          marketing_emails: profile.marketing_emails ?? false,
        });
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const handleSaveCompany = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("companies")
        .update({
          name: companyData.name,
          restaurant_type: companyData.restaurant_type,
          google_review_link: companyData.google_review_link,
          logo_url: companyData.logo_url,
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
      setSaving(false);
    }
  };

  const handleLinkGoogle = async () => {
    if (!user || !selectedPlace || !companyId) return;
    setSavingGoogle(true);

    try {
      // Get current rating data from the selected place
      const rating = selectedPlace.rating || null;
      const ratingsTotal = selectedPlace.user_ratings_total || null;

      const { error } = await supabase
        .from("companies")
        .update({
          google_place_id: selectedPlace.place_id,
          google_review_link: selectedPlace.google_maps_url,
          google_rating: rating,
          google_user_ratings_total: ratingsTotal,
          initial_google_rating: rating,
          initial_google_ratings_total: ratingsTotal,
          current_google_rating: rating,
          current_google_ratings_total: ratingsTotal,
        })
        .eq("id", companyId);

      if (error) throw error;

      // Update local state
      setCompanyData({
        ...companyData,
        google_place_id: selectedPlace.place_id,
        google_review_link: selectedPlace.google_maps_url,
        initial_google_rating: rating,
        initial_google_ratings_total: ratingsTotal,
        current_google_rating: rating,
        current_google_ratings_total: ratingsTotal,
      });

      setShowGoogleSearch(false);
      setSelectedPlace(null);

      toast({
        title: "Restaurante vinculado ao Google!",
        description: `Nota atual: ${rating?.toFixed(1) || "N/A"} com ${ratingsTotal || 0} avaliações`,
      });
    } catch (error) {
      console.error("Erro ao vincular Google:", error);
      toast({
        title: "Erro ao vincular",
        description: "Não foi possível vincular seu restaurante ao Google.",
        variant: "destructive",
      });
    } finally {
      setSavingGoogle(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o perfil.",
        variant: "destructive",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleNotificationChange = async (key: keyof NotificationPrefs, value: boolean) => {
    if (!user) return;

    const newNotifications = { ...notifications, [key]: value };
    setNotifications(newNotifications);

    const { error } = await supabase
      .from("profiles")
      .update({ [key]: value })
      .eq("user_id", user.id);

    if (error) {
      setNotifications(notifications);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a preferência.",
        variant: "destructive",
      });
    } else {
      toast({ title: "Preferência salva" });
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.current) {
      toast({
        title: "Erro",
        description: "Digite sua senha atual.",
        variant: "destructive",
      });
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (passwords.new.length < 8) {
      toast({
        title: "Erro",
        description: "A senha deve ter no mínimo 8 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setSavingPassword(true);

    // Verify current password by re-authenticating
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user?.email || "",
      password: passwords.current,
    });

    if (authError) {
      toast({
        title: "Erro",
        description: "Senha atual incorreta.",
        variant: "destructive",
      });
      setSavingPassword(false);
      return;
    }

    // Now change password
    const { error } = await supabase.auth.updateUser({
      password: passwords.new,
    });

    if (error) {
      toast({
        title: "Erro ao alterar senha",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso!",
        description: "Sua senha foi alterada.",
      });
      setPasswords({ current: "", new: "", confirm: "" });
    }

    setSavingPassword(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !companyId) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O logo deve ter no máximo 2MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingLogo(true);

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

      setCompanyData({ ...companyData, logo_url: publicUrl });

      toast({
        title: "Logo enviado!",
        description: "Não esqueça de salvar as alterações.",
      });
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar o logo.",
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeletingAccount(true);

    try {
      const { data, error } = await supabase.functions.invoke('delete-account');

      if (error) throw error;

      toast({
        title: "Conta excluída",
        description: "Todos os seus dados foram removidos.",
      });
      
      await signOut();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a conta.",
        variant: "destructive",
      });
    } finally {
      setDeletingAccount(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length < 8) return { label: "Fraca", color: "bg-destructive" };
    if (password.length < 12) return { label: "Média", color: "bg-amber-500" };
    return { label: "Forte", color: "bg-success" };
  };

  const evaluationUrl = `${window.location.origin}/avaliar/${companyData.slug}`;

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Configurações - Avalia Aí</title>
        </Helmet>
        <DashboardLayout>
          <div className="space-y-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-12 w-full max-w-md" />
            <Skeleton className="h-96 w-full max-w-2xl" />
          </div>
        </DashboardLayout>
      </>
    );
  }

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

        <Tabs defaultValue="empresa" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 lg:w-[500px]">
            <TabsTrigger value="empresa" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Empresa</span>
            </TabsTrigger>
            <TabsTrigger value="perfil" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="notificacoes" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="conta" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Conta</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Empresa */}
          <TabsContent value="empresa">
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-coral" />
                  Informações da Empresa
                </CardTitle>
                <CardDescription>
                  Dados que aparecem na página de avaliação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo Upload */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={companyData.logo_url} alt={companyData.name} />
                      <AvatarFallback className="text-2xl bg-coral/10 text-coral">
                        {companyData.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {uploadingLogo && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                        <Loader2 className="w-6 h-6 animate-spin text-coral" />
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="logo-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors">
                        <Upload className="w-4 h-4" />
                        <span>Alterar Logo</span>
                      </div>
                    </Label>
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG até 2MB</p>
                  </div>
                </div>

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
                  <Select 
                    value={companyData.restaurant_type} 
                    onValueChange={(v) => setCompanyData({ ...companyData, restaurant_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="restaurante">Restaurante</SelectItem>
                      <SelectItem value="pizzaria">Pizzaria</SelectItem>
                      <SelectItem value="hamburgueria">Hamburgueria</SelectItem>
                      <SelectItem value="cafeteria">Cafeteria</SelectItem>
                      <SelectItem value="bar">Bar</SelectItem>
                      <SelectItem value="padaria">Padaria</SelectItem>
                      <SelectItem value="food-truck">Food Truck</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Seção de Vinculação ao Google */}
                <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <Label className="text-base font-semibold">Vinculação ao Google</Label>
                  </div>

                  {companyData.google_place_id ? (
                    // Já vinculado
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span>Restaurante vinculado ao Google</span>
                      </div>
                      
                      {(companyData.current_google_rating !== null || companyData.initial_google_rating !== null) && (
                        <div className="grid grid-cols-2 gap-4 p-3 bg-background rounded-lg border">
                          <div>
                            <p className="text-xs text-muted-foreground">Nota Atual</p>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="font-semibold">
                                {companyData.current_google_rating?.toFixed(1) || "N/A"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({companyData.current_google_ratings_total || 0} avaliações)
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Nota Inicial</p>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">
                                {companyData.initial_google_rating?.toFixed(1) || "N/A"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({companyData.initial_google_ratings_total || 0} avaliações)
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowGoogleSearch(true)}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Alterar Restaurante
                        </Button>
                        {companyData.google_review_link && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={companyData.google_review_link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Ver no Google
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    // Não vinculado - mostrar alerta
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-800 dark:text-amber-200">
                            Restaurante não vinculado ao Google
                          </p>
                          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                            Vincule seu restaurante para acompanhar sua evolução no Google e direcionar clientes satisfeitos para deixarem avaliações.
                          </p>
                        </div>
                      </div>
                      <Button onClick={() => setShowGoogleSearch(true)} className="bg-coral hover:bg-coral-dark">
                        <MapPin className="w-4 h-4 mr-2" />
                        Vincular ao Google
                      </Button>
                    </div>
                  )}

                  {/* Modal de busca */}
                  {showGoogleSearch && (
                    <div className="space-y-4 p-4 border-2 border-primary/30 rounded-lg bg-background">
                      <p className="text-sm font-medium">Busque seu restaurante no Google:</p>
                      <PlaceSearch
                        onSelect={setSelectedPlace}
                        selectedPlace={selectedPlace}
                        restaurantName={companyData.name}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowGoogleSearch(false);
                            setSelectedPlace(null);
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleLinkGoogle}
                          disabled={!selectedPlace || savingGoogle}
                          className="bg-coral hover:bg-coral-dark"
                        >
                          {savingGoogle ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Confirmar Vinculação
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label>Seu Link de Avaliação</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <span className="text-sm text-muted-foreground break-all">{evaluationUrl}</span>
                  </div>
                </div>

                <Button onClick={handleSaveCompany} disabled={saving} className="bg-coral hover:bg-coral-dark">
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Salvar alterações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Perfil */}
          <TabsContent value="perfil">
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-coral" />
                  Seu Perfil
                </CardTitle>
                <CardDescription>
                  Gerencie suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="text-xl bg-primary/10 text-primary">
                      {user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{profileData.full_name || "Usuário"}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="full-name">Nome Completo</Label>
                  <Input
                    id="full-name"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    placeholder="Seu nome"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <Button onClick={handleSaveProfile} disabled={savingProfile} className="bg-coral hover:bg-coral-dark">
                  {savingProfile ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Salvar Perfil
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Notificações */}
          <TabsContent value="notificacoes">
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-coral" />
                  Preferências de Notificação
                </CardTitle>
                <CardDescription>
                  Escolha como deseja ser notificado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba um email quando houver novos feedbacks
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email_notifications}
                    onCheckedChange={(v) => handleNotificationChange("email_notifications", v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Resumo Semanal</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba um relatório semanal com suas métricas
                    </p>
                  </div>
                  <Switch
                    checked={notifications.weekly_summary}
                    onCheckedChange={(v) => handleNotificationChange("weekly_summary", v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertas de Feedback Negativo</Label>
                    <p className="text-sm text-muted-foreground">
                      Seja notificado sobre avaliações de 1-2 estrelas
                    </p>
                  </div>
                  <Switch
                    checked={notifications.negative_alerts}
                    onCheckedChange={(v) => handleNotificationChange("negative_alerts", v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Novidades e Dicas</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba atualizações sobre novas funcionalidades
                    </p>
                  </div>
                  <Switch
                    checked={notifications.marketing_emails}
                    onCheckedChange={(v) => handleNotificationChange("marketing_emails", v)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Conta */}
          <TabsContent value="conta">
            <div className="max-w-2xl space-y-6">
              {/* Alterar Senha */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-coral" />
                    Segurança
                  </CardTitle>
                  <CardDescription>
                    Altere sua senha de acesso
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="current-password">Senha Atual</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwords.current}
                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                        placeholder="••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="new-password">Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwords.new}
                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                        placeholder="••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    {passwords.new && (
                      <div className="flex items-center gap-2">
                        <div className={`h-1 flex-1 rounded ${getPasswordStrength(passwords.new).color}`} />
                        <span className="text-xs text-muted-foreground">
                          {getPasswordStrength(passwords.new).label}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                        placeholder="••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    onClick={handleChangePassword} 
                    disabled={savingPassword || !passwords.new || !passwords.confirm}
                  >
                    {savingPassword ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Alterar Senha
                  </Button>
                </CardContent>
              </Card>

              {/* Assinatura */}
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
                <CardContent>
                  <div className="p-4 rounded-lg bg-coral/10 border border-coral/20">
                    <p className="font-medium text-foreground">Período de Trial</p>
                    <p className="text-sm text-muted-foreground">
                      Você está no período de teste gratuito de 14 dias.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Zona de Perigo */}
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
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir Minha Conta
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Todos os seus dados, incluindo
                          feedbacks e configurações, serão permanentemente removidos.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="my-4">
                        <Label htmlFor="delete-confirm">
                          Digite <strong>EXCLUIR</strong> para confirmar
                        </Label>
                        <Input
                          id="delete-confirm"
                          value={deleteConfirmation}
                          onChange={(e) => setDeleteConfirmation(e.target.value)}
                          placeholder="EXCLUIR"
                          className="mt-2"
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteConfirmation("")}>
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={deleteConfirmation !== "EXCLUIR" || deletingAccount}
                          onClick={handleDeleteAccount}
                        >
                          {deletingAccount ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Excluindo...
                            </>
                          ) : (
                            "Excluir Conta Permanentemente"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DashboardLayout>
    </>
  );
};

export default DashboardSettings;