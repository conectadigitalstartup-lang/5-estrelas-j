import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSubscription, PLANS } from "./useSubscription";
import { useToast } from "./use-toast";

export const usePaywall = () => {
  const { subscribed, status, isSuperAdmin, createCheckoutWithTrial, isLoading } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();

  const hasAccess = subscribed || isSuperAdmin || status === "active";
  const isInTrial = status === "trial" && !subscribed && !isSuperAdmin;

  const requireSubscription = useCallback(
    async (featureName?: string) => {
      if (hasAccess) {
        return true;
      }

      // User is in trial or inactive - redirect to checkout
      toast({
        title: "Funcionalidade Premium",
        description: featureName
          ? `Para ${featureName}, você precisa de uma assinatura ativa.`
          : "Esta funcionalidade requer uma assinatura ativa.",
      });

      try {
        await createCheckoutWithTrial(PLANS.basico.priceId);
      } catch (error) {
        // If checkout fails, redirect to upgrade page
        navigate("/dashboard/upgrade");
      }

      return false;
    },
    [hasAccess, toast, createCheckoutWithTrial, navigate]
  );

  const checkAccess = useCallback(() => {
    return hasAccess;
  }, [hasAccess]);

  return {
    hasAccess,
    isInTrial,
    isLoading,
    requireSubscription,
    checkAccess,
  };
};