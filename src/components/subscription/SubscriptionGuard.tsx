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
 * - Trialing with valid trial (daysLeft > 0): ACCESS  
 * - Trial expired (daysLeft <= 0): BLOCKED -> redirect to /assinatura-pendente
 * - Past Due / Unpaid / Canceled: BLOCKED -> redirect to /assinatura-pendente
 */
export const SubscriptionGuard = ({ 
  children, 
  requireActive = false 
}: SubscriptionGuardProps) => {
  const { status, isLoading, isSuperAdmin, subscribed, subscriptionEnd, daysLeft } = useSubscription();

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

  // Valid trial = ACCESS only if daysLeft > 0
  if (status === "trial" && daysLeft > 0) {
    return <>{children}</>;
  }

  // Check if canceled but still in paid period
  if (subscriptionEnd) {
    const endDate = new Date(subscriptionEnd);
    if (endDate > new Date()) {
      return <>{children}</>;
    }
  }

  // BLOCKED: Trial expired OR inactive/past_due/canceled
  // Redirect to payment page - the ONLY option for expired users
  return <Navigate to="/assinatura-pendente" replace />;
};
