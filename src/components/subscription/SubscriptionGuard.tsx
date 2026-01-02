import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { Loader2 } from "lucide-react";

interface SubscriptionGuardProps {
  children: ReactNode;
  requireActive?: boolean;
}

/**
 * SubscriptionGuard - The "Digital Doorman" for premium features
 * 
 * Rules:
 * - Super Admin: ALWAYS has access
 * - Active subscription: ACCESS
 * - Trialing with valid trial: ACCESS  
 * - Canceled but in paid period: ACCESS (until period ends)
 * - Past Due / Unpaid / Expired: BLOCKED -> redirect to /assinatura-pendente
 */
export const SubscriptionGuard = ({ 
  children, 
  requireActive = false 
}: SubscriptionGuardProps) => {
  const { status, isLoading, isSuperAdmin, subscribed, subscriptionEnd } = useSubscription();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Super admin ALWAYS has access (bypass all checks)
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  // Active subscription = ACCESS
  if (status === "active" || subscribed) {
    return <>{children}</>;
  }

  // Valid trial = ACCESS
  if (status === "trial") {
    return <>{children}</>;
  }

  // Check if canceled but still in paid period
  if (subscriptionEnd) {
    const endDate = new Date(subscriptionEnd);
    if (endDate > new Date()) {
      return <>{children}</>;
    }
  }

  // If we require active and status is inactive/past_due/canceled -> BLOCKED
  if (requireActive || status === "inactive") {
    return <Navigate to="/assinatura-pendente" replace />;
  }

  // Default: allow access (for pages that don't require active subscription)
  return <>{children}</>;
};
