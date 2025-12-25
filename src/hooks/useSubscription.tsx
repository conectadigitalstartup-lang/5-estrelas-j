import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface SubscriptionState {
  subscribed: boolean;
  status: "trial" | "active" | "inactive" | null;
  plan: "basico" | "pro" | null;
  subscriptionEnd: string | null;
  trialEndsAt: string | null;
  daysLeft: number;
  isLoading: boolean;
  isSuperAdmin: boolean;
}

// Plan configuration
export const PLANS = {
  basico: {
    name: "Básico",
    priceId: "price_1SfVcLKB3IHyjJpdGUY69Fbs",
    productId: "prod_Tcl8m303dMbLrU",
    price: 99,
  },
  pro: {
    name: "Pro",
    priceId: "price_1SfVcYKB3IHyjJpd6q8CqE1y",
    productId: "prod_Tcl8KdZ5nWaUR3",
    price: 199,
  },
} as const;

const calculateDaysLeft = (trialEndsAt: string | null): number => {
  if (!trialEndsAt) return 0;
  const now = new Date();
  const endDate = new Date(trialEndsAt);
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

export const useSubscription = () => {
  const { user, session } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    subscribed: false,
    status: null,
    plan: null,
    subscriptionEnd: null,
    trialEndsAt: null,
    daysLeft: 14,
    isLoading: true,
    isSuperAdmin: false,
  });

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      // First check local subscriptions table
      const { data: subData, error: subError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (subError && subError.code !== "PGRST116") {
        console.error("Error fetching subscription:", subError);
      }

      if (subData) {
        const isSuperAdmin = (subData as any).is_super_admin === true;
        const daysLeft = calculateDaysLeft(subData.trial_ends_at);
        const isTrialExpired = subData.status === "trialing" && daysLeft <= 0;
        
        let effectiveStatus: "trial" | "active" | "inactive" = "trial";
        // Super admin always has active status
        if (isSuperAdmin || subData.status === "active") {
          effectiveStatus = "active";
        } else if (isTrialExpired || subData.status === "canceled" || subData.status === "past_due") {
          effectiveStatus = "inactive";
        } else if (subData.status === "trialing") {
          effectiveStatus = "trial";
        }

        setState({
          subscribed: isSuperAdmin || subData.status === "active",
          status: effectiveStatus,
          plan: (subData.plan as "basico" | "pro") || null,
          subscriptionEnd: subData.current_period_end,
          trialEndsAt: subData.trial_ends_at,
          daysLeft,
          isLoading: false,
          isSuperAdmin,
        });
        return;
      }

      // Fallback to edge function if no local data
      if (session?.access_token) {
        const { data, error } = await supabase.functions.invoke("check-subscription", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) {
          console.error("Error checking subscription:", error);
          setState(prev => ({ ...prev, isLoading: false, status: "trial" }));
          return;
        }

        setState({
          subscribed: data.subscribed,
          status: data.status,
          plan: data.plan,
          subscriptionEnd: data.subscription_end,
          trialEndsAt: null,
          daysLeft: 14,
          isLoading: false,
          isSuperAdmin: data.is_super_admin || false,
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      setState(prev => ({ ...prev, isLoading: false, status: "trial" }));
    }
  }, [user, session?.access_token]);

  const createCheckout = async (priceId: string) => {
    if (!session?.access_token) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { priceId },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
    if (data?.url) {
      window.open(data.url, "_blank");
    }
  };

  const createCheckoutWithTrial = async (priceId: string) => {
    if (!session?.access_token) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { priceId, withTrial: true },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
    if (data?.url) {
      window.location.href = data.url;
    }
  };

  const openCustomerPortal = async () => {
    if (!session?.access_token) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase.functions.invoke("customer-portal", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
    if (data?.url) {
      window.open(data.url, "_blank");
    }
  };

  useEffect(() => {
    if (user) {
      checkSubscription();
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user, checkSubscription]);

  // Refresh subscription status periodically
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      checkSubscription();
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  return {
    ...state,
    checkSubscription,
    createCheckout,
    createCheckoutWithTrial,
    openCustomerPortal,
  };
};
