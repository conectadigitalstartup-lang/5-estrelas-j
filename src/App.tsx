import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Precos from "./pages/Precos";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import DashboardQRCode from "./pages/DashboardQRCode";
import DashboardFeedbacks from "./pages/DashboardFeedbacks";
import DashboardSettings from "./pages/DashboardSettings";
import DashboardUpgrade from "./pages/DashboardUpgrade";
import Avaliar from "./pages/Avaliar";
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
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/cadastro" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/qr-code" element={<DashboardQRCode />} />
              <Route path="/dashboard/feedbacks" element={<DashboardFeedbacks />} />
              <Route path="/dashboard/settings" element={<DashboardSettings />} />
              <Route path="/dashboard/upgrade" element={<DashboardUpgrade />} />
              <Route path="/avaliar/:slug" element={<Avaliar />} />
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
