import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { Loader2 } from "lucide-react";

interface SubscriptionGuardProps {
  children: ReactNode;
  requireActive?: boolean;
}

export const SubscriptionGuard = ({ 
  children, 
  requireActive = false 
}: SubscriptionGuardProps) => {
  const { status, isLoading, isSuperAdmin } = useSubscription();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Super admin always has access
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  // If subscription is inactive and we require active, redirect to upgrade
  if (requireActive && status === "inactive") {
    return <Navigate to="/dashboard/upgrade" replace />;
  }

  return <>{children}</>;
};
