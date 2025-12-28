import { ReactNode, useEffect, useState, useRef } from "react";
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
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user) {
        setCheckingStatus(false);
        return;
      }

      // Prevent duplicate checks
      if (hasCheckedRef.current) return;
      hasCheckedRef.current = true;

      try {
        // Only check onboarding status - subscription is NOT required for dashboard access
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
        }

        setOnboardingCompleted(profile?.onboarding_completed ?? false);
      } catch (error) {
        console.error("Error checking user status:", error);
        setOnboardingCompleted(false);
      } finally {
        setCheckingStatus(false);
      }
    };

    // Only check status after auth loading is complete
    if (!authLoading) {
      if (user) {
        checkUserStatus();
      } else {
        setCheckingStatus(false);
      }
    }
  }, [user, authLoading]);

  // Reset ref when user changes
  useEffect(() => {
    hasCheckedRef.current = false;
  }, [user?.id]);

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