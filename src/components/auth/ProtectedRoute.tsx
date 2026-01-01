import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user) {
        setCheckingStatus(false);
        setOnboardingCompleted(null);
        return;
      }

      try {
        // Only check onboarding status - subscription is NOT required for dashboard access
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setOnboardingCompleted(false);
        } else {
          setOnboardingCompleted(profile?.onboarding_completed ?? false);
        }
      } catch (error) {
        console.error("Error checking user status:", error);
        setOnboardingCompleted(false);
      } finally {
        setCheckingStatus(false);
      }
    };

    // Reset state and check when user or auth loading changes
    if (!authLoading) {
      setCheckingStatus(true);
      checkUserStatus();
    }
  }, [user?.id, authLoading]);

  // Show loading while auth is being verified OR while checking user status
  if (authLoading || checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Verificando sessão...</p>
        </div>
      </div>
    );
  }

  // Only redirect after loading is complete
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If on onboarding page, allow access
  if (location.pathname === "/onboarding") {
    return <>{children}</>;
  }

  // If onboarding not completed, redirect to onboarding
  if (onboardingCompleted === false) {
    return <Navigate to="/onboarding" replace />;
  }

  // Allow access to all dashboard routes - paywall is handled at feature level
  return <>{children}</>;
};

export default ProtectedRoute;
