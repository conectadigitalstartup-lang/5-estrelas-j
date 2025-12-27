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
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null);
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
        // Check onboarding and subscription status in parallel
        const [profileResult, subscriptionResult] = await Promise.all([
          supabase
            .from("profiles")
            .select("onboarding_completed")
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase
            .from("subscriptions")
            .select("status, trial_ends_at, is_super_admin")
            .eq("user_id", user.id)
            .maybeSingle()
        ]);

        setOnboardingCompleted(profileResult.data?.onboarding_completed ?? false);
        
        // Check if user has active or trialing subscription
        // Super admin always has access
        const subscription = subscriptionResult.data;
        const isSuperAdmin = (subscription as any)?.is_super_admin === true;
        const isActive = isSuperAdmin || subscription?.status === "active" || subscription?.status === "trialing";
        setHasActiveSubscription(isActive);
      } catch (error) {
        console.error("Error checking user status:", error);
        setOnboardingCompleted(false);
        setHasActiveSubscription(false);
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

  // Allow access to complete-registration page
  if (location.pathname === "/complete-registration") {
    return <>{children}</>;
  }

  // If no active subscription, redirect to complete-registration
  if (hasActiveSubscription === false) {
    return <Navigate to="/complete-registration" replace />;
  }

  // If on onboarding page, allow access
  if (location.pathname === "/onboarding") {
    return <>{children}</>;
  }

  // If onboarding not completed, redirect to onboarding
  if (onboardingCompleted === false) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;