import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface Profile {
  restaurant_name: string | null;
  trial_ends_at: string | null;
  subscription_status: string | null;
  onboarding_completed: boolean | null;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Fetch profile and company data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("restaurant_name, trial_ends_at, subscription_status, onboarding_completed")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch company to get unread feedbacks count
      const { data: company } = await supabase
        .from("companies")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (company) {
        const { count } = await supabase
          .from("feedbacks")
          .select("*", { count: "exact", head: true })
          .eq("company_id", company.id)
          .lt("rating", 4);

        setUnreadCount(count || 0);
      }
    };

    fetchData();
  }, [user]);

  // Calculate trial days left
  const trialDaysLeft = profile?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(profile.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : undefined;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-coral" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      {!isMobile && (
        <DashboardSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobile && mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-foreground/50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <DashboardSidebar
            collapsed={false}
            onToggle={() => setMobileMenuOpen(false)}
          />
        </>
      )}

      {/* Main Content */}
      <div
        className={cn(
          "transition-all duration-300",
          !isMobile && (sidebarCollapsed ? "ml-16" : "ml-64")
        )}
      >
        <DashboardHeader
          companyName={profile?.restaurant_name || "Meu Restaurante"}
          trialDaysLeft={profile?.subscription_status === "trial" ? trialDaysLeft : undefined}
          unreadCount={unreadCount}
          onMenuClick={() => setMobileMenuOpen(true)}
          isMobile={isMobile}
        />

        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;