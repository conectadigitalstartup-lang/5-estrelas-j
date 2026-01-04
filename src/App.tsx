import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PublicRoute from "@/components/auth/PublicRoute";
import { SubscriptionGuard } from "@/components/subscription/SubscriptionGuard";
import { Loader2 } from "lucide-react";

// Lazy load pages for better initial load performance
const Index = lazy(() => import("./pages/Index"));
const Precos = lazy(() => import("./pages/Precos"));
const Termos = lazy(() => import("./pages/Termos"));
const Privacidade = lazy(() => import("./pages/Privacidade"));
const Auth = lazy(() => import("./pages/Auth"));
const EsqueciSenha = lazy(() => import("./pages/EsqueciSenha"));
const AtualizarSenha = lazy(() => import("./pages/AtualizarSenha"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DashboardQRCode = lazy(() => import("./pages/DashboardQRCode"));
const DashboardFeedbacks = lazy(() => import("./pages/DashboardFeedbacks"));
const DashboardSettings = lazy(() => import("./pages/DashboardSettings"));
const DashboardUpgrade = lazy(() => import("./pages/DashboardUpgrade"));
const DashboardSupport = lazy(() => import("./pages/DashboardSupport"));
const DashboardFoodPhotos = lazy(() => import("./pages/DashboardFoodPhotos"));
const DashboardClientes = lazy(() => import("./pages/DashboardClientes"));
const Avaliar = lazy(() => import("./pages/Avaliar"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AssinaturaPendente = lazy(() => import("./pages/AssinaturaPendente"));

// Admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminUserDetail = lazy(() => import("./pages/admin/AdminUserDetail"));
const AdminRestaurants = lazy(() => import("./pages/admin/AdminRestaurants"));
const AdminSubscriptions = lazy(() => import("./pages/admin/AdminSubscriptions"));
const AdminSupportPage = lazy(() => import("./pages/admin/AdminSupportPage"));

const queryClient = new QueryClient();

// Global loading spinner component
const GlobalLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">Carregando...</p>
    </div>
  </div>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<GlobalLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/precos" element={<Precos />} />
                <Route path="/termos" element={<Termos />} />
                <Route path="/privacidade" element={<Privacidade />} />
                <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
                <Route path="/login" element={<PublicRoute><Auth /></PublicRoute>} />
                <Route path="/cadastro" element={<PublicRoute><Auth /></PublicRoute>} />
                <Route path="/esqueci-senha" element={<EsqueciSenha />} />
                <Route path="/atualizar-senha" element={<AtualizarSenha />} />
                <Route path="/avaliar/:slug" element={<Avaliar />} />
                
                {/* Onboarding - Protected but no subscription check */}
                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                
                {/* Subscription Pending - Protected but no subscription check */}
                <Route path="/assinatura-pendente" element={<ProtectedRoute><AssinaturaPendente /></ProtectedRoute>} />
                
                {/* Dashboard Routes - Protected AND Subscription Gated */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <SubscriptionGuard requireActive>
                      <Dashboard />
                    </SubscriptionGuard>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/qr-code" element={
                  <ProtectedRoute>
                    <SubscriptionGuard requireActive>
                      <DashboardQRCode />
                    </SubscriptionGuard>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/feedbacks" element={
                  <ProtectedRoute>
                    <SubscriptionGuard requireActive>
                      <DashboardFeedbacks />
                    </SubscriptionGuard>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/melhorar-fotos" element={
                  <ProtectedRoute>
                    <SubscriptionGuard requireActive>
                      <DashboardFoodPhotos />
                    </SubscriptionGuard>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/clientes" element={
                  <ProtectedRoute>
                    <SubscriptionGuard requireActive>
                      <DashboardClientes />
                    </SubscriptionGuard>
                  </ProtectedRoute>
                } />
                
                {/* Settings, Support, Upgrade - Protected but accessible for payment recovery */}
                <Route path="/dashboard/settings" element={<ProtectedRoute><DashboardSettings /></ProtectedRoute>} />
                <Route path="/dashboard/upgrade" element={<ProtectedRoute><DashboardUpgrade /></ProtectedRoute>} />
                <Route path="/dashboard/suporte" element={<ProtectedRoute><DashboardSupport /></ProtectedRoute>} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/users/:userId" element={<AdminUserDetail />} />
                <Route path="/admin/restaurants" element={<AdminRestaurants />} />
                <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
                <Route path="/admin/support" element={<AdminSupportPage />} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;