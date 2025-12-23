import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user) {
        setCheckingStatus(false);
        return;
      }

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
            .select("status, trial_ends_at")
            .eq("user_id", user.id)
            .maybeSingle()
        ]);

        setOnboardingCompleted(profileResult.data?.onboarding_completed ?? false);
        
        // Check if user has active or trialing subscription
        const subscription = subscriptionResult.data;
        const isActive = subscription?.status === "active" || subscription?.status === "trialing";
        setHasActiveSubscription(isActive);
      } catch (error) {
        console.error("Error checking user status:", error);
        setOnboardingCompleted(false);
        setHasActiveSubscription(false);
      } finally {
        setCheckingStatus(false);
      }
    };

    if (!loading && user) {
      checkUserStatus();
    } else if (!loading) {
      setCheckingStatus(false);
    }
  }, [user, loading]);

  if (loading || checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-coral" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
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
