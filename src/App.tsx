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
import { Loader2 } from "lucide-react";

// Lazy load pages for better initial load performance
const Index = lazy(() => import("./pages/Index"));
const Precos = lazy(() => import("./pages/Precos"));
const Auth = lazy(() => import("./pages/Auth"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DashboardQRCode = lazy(() => import("./pages/DashboardQRCode"));
const DashboardFeedbacks = lazy(() => import("./pages/DashboardFeedbacks"));
const DashboardSettings = lazy(() => import("./pages/DashboardSettings"));
const DashboardUpgrade = lazy(() => import("./pages/DashboardUpgrade"));
const DashboardSupport = lazy(() => import("./pages/DashboardSupport"));
const Avaliar = lazy(() => import("./pages/Avaliar"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminSupport = lazy(() => import("./pages/AdminSupport"));
const CompleteRegistration = lazy(() => import("./pages/CompleteRegistration"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
                <Route path="/" element={<Index />} />
                <Route path="/precos" element={<Precos />} />
                <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
                <Route path="/login" element={<PublicRoute><Auth /></PublicRoute>} />
                <Route path="/cadastro" element={<PublicRoute><Auth /></PublicRoute>} />
                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/dashboard/qr-code" element={<ProtectedRoute><DashboardQRCode /></ProtectedRoute>} />
                <Route path="/dashboard/feedbacks" element={<ProtectedRoute><DashboardFeedbacks /></ProtectedRoute>} />
                <Route path="/dashboard/settings" element={<ProtectedRoute><DashboardSettings /></ProtectedRoute>} />
                <Route path="/dashboard/upgrade" element={<ProtectedRoute><DashboardUpgrade /></ProtectedRoute>} />
                <Route path="/dashboard/suporte" element={<ProtectedRoute><DashboardSupport /></ProtectedRoute>} />
                <Route path="/avaliar/:slug" element={<Avaliar />} />
                <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                <Route path="/admin-dashboard" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                <Route path="/admin/suporte" element={<ProtectedRoute><AdminSupport /></ProtectedRoute>} />
                <Route path="/admin-dashboard/suporte" element={<ProtectedRoute><AdminSupport /></ProtectedRoute>} />
                <Route path="/complete-registration" element={<ProtectedRoute><CompleteRegistration /></ProtectedRoute>} />
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