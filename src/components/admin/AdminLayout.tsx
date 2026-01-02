import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  Headphones,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import avaliaProLogo from "@/assets/avalia-pro-logo.png";

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { path: "/admin/users", label: "Clientes", icon: Users },
  { path: "/admin/restaurants", label: "Restaurantes", icon: Building2 },
  { path: "/admin/subscriptions", label: "Assinaturas", icon: CreditCard },
  { path: "/admin/support", label: "Suporte", icon: Headphones },
];

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, loading: authLoading, signOut } = useAuth();
  const location = useLocation();
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkSuperAdmin = async () => {
      if (!user) {
        setIsSuperAdmin(false);
        setCheckingAdmin(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("subscriptions")
          .select("is_super_admin")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error checking admin status:", error);
          setIsSuperAdmin(false);
        } else {
          setIsSuperAdmin(data?.is_super_admin === true);
        }
      } catch (err) {
        console.error("Error:", err);
        setIsSuperAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    if (!authLoading) {
      checkSuperAdmin();
    }
  }, [user, authLoading]);

  if (authLoading || checkingAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || !isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed inset-y-0 left-0 z-50 bg-card border-r border-border transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <img 
                src={avaliaProLogo} 
                alt="Avalia Pro Admin" 
                className="h-8 w-auto object-contain"
              />
              <span className="font-display font-bold text-foreground">Admin</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="shrink-0"
          >
            <ChevronRight className={cn("h-4 w-4 transition-transform", !sidebarOpen && "rotate-180")} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                isActive(item.path, item.exact)
                  ? "bg-coral/10 text-coral font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2">
          <Link to="/dashboard">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-primary/10",
                !sidebarOpen && "justify-center px-0"
              )}
            >
              <Home className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span>Voltar ao App</span>}
            </Button>
          </Link>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-muted-foreground hover:text-foreground",
              !sidebarOpen && "justify-center px-0"
            )}
            onClick={() => signOut()}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span>Sair</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img 
            src={avaliaProLogo} 
            alt="Avalia Pro Admin" 
            className="h-8 w-auto object-contain"
          />
          <span className="font-display font-bold text-foreground">Admin</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border pt-16" onClick={(e) => e.stopPropagation()}>
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    isActive(item.path, item.exact)
                      ? "bg-coral/10 text-coral font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border space-y-2">
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-primary/10"
                >
                  <Home className="h-5 w-5 shrink-0" />
                  <span>Voltar ao App</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
                onClick={() => signOut()}
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 min-h-screen transition-all duration-300",
          "lg:ml-64",
          !sidebarOpen && "lg:ml-20",
          "pt-16 lg:pt-0"
        )}
      >
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
