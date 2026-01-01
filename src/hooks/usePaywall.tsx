import { useCallback } from "react";
import { useSubscription } from "./useSubscription";

export const usePaywall = () => {
  const { subscribed, status, isSuperAdmin, isLoading, daysLeft } = useSubscription();

  // NOVO MODELO: Trial de 7 dias SEM cartão
  // hasAccess = superAdmin OU assinatura ativa OU em trial válido (daysLeft > 0)
  const isTrialValid = status === "trial" && daysLeft > 0;
  const hasAccess = isSuperAdmin || subscribed || status === "active" || isTrialValid;
  
  // Trial expirado = estava em trial mas dias acabaram
  const isTrialExpired = status === "trial" && daysLeft <= 0;
  const isInTrial = isTrialValid && !subscribed && !isSuperAdmin;

  const checkAccess = useCallback(() => {
    return hasAccess;
  }, [hasAccess]);

  return {
    hasAccess,
    isInTrial,
    isTrialExpired,
    isLoading,
    checkAccess,
    daysLeft,
  };
};