import { useCallback } from "react";
import { useSubscription } from "./useSubscription";

export const usePaywall = () => {
  const { subscribed, status, isSuperAdmin, isLoading } = useSubscription();

  // User has access if they have an active subscription, are in trial with valid trial, or are super admin
  const hasAccess = subscribed || isSuperAdmin || status === "active";
  const isInTrial = status === "trial" && !subscribed && !isSuperAdmin;

  const checkAccess = useCallback(() => {
    return hasAccess;
  }, [hasAccess]);

  return {
    hasAccess,
    isInTrial,
    isLoading,
    checkAccess,
  };
};