import { useCallback } from "react";
import { useSubscription } from "./useSubscription";

export const usePaywall = () => {
  const { subscribed, status, isSuperAdmin, isLoading, daysLeft } = useSubscription();

  // MODELO DEFINITIVO: Trial de 7 dias SEM cartão
  // Após 7 dias, TUDO fica bloqueado até pagar
  
  // Trial válido = em trial E ainda tem dias restantes
  const isTrialValid = status === "trial" && daysLeft > 0;
  
  // Trial expirado = estava em trial mas dias acabaram (daysLeft <= 0)
  const isTrialExpired = status === "trial" && daysLeft <= 0;
  
  // Status inativo (canceled, past_due, unpaid, inactive)
  const isStatusInactive = status === "inactive";
  
  // hasAccess: superAdmin OU assinatura ativa OU em trial válido
  // NÃO tem acesso se: trial expirado OU status inativo
  const hasAccess = isSuperAdmin || subscribed || status === "active" || isTrialValid;
  
  // Está em trial válido (para mostrar banner)
  const isInTrial = isTrialValid && !subscribed && !isSuperAdmin;
  
  // Deve ser bloqueado (trial expirou ou status inativo)
  const shouldBlock = !isSuperAdmin && !subscribed && status !== "active" && (isTrialExpired || isStatusInactive);

  const checkAccess = useCallback(() => {
    return hasAccess && !shouldBlock;
  }, [hasAccess, shouldBlock]);

  return {
    hasAccess: hasAccess && !shouldBlock,
    isInTrial,
    isTrialExpired,
    isLoading,
    checkAccess,
    daysLeft,
    shouldBlock,
  };
};