import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PublicRoute from "@/components/auth/PublicRoute";
import Index from "./pages/Index";
import Precos from "./pages/Precos";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import DashboardQRCode from "./pages/DashboardQRCode";
import DashboardFeedbacks from "./pages/DashboardFeedbacks";
import DashboardSettings from "./pages/DashboardSettings";
import DashboardUpgrade from "./pages/DashboardUpgrade";
import Avaliar from "./pages/Avaliar";
import Admin from "./pages/Admin";
import CompleteRegistration from "./pages/CompleteRegistration";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
              <Route path="/avaliar/:slug" element={<Avaliar />} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
              <Route path="/admin-dashboard" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
              <Route path="/complete-registration" element={<ProtectedRoute><CompleteRegistration /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
