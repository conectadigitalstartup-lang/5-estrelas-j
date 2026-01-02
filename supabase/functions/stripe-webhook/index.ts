import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Product IDs to plan mapping
const PRODUCT_PLANS: Record<string, string> = {
  "prod_TiittWhXGYX07a": "profissional", // New R$ 97/month plan
  "prod_Tcl8m303dMbLrU": "basico", // Legacy
  "prod_Tcl8KdZ5nWaUR3": "pro", // Legacy
};

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      logStep("ERROR: No signature provided");
      return new Response("No signature", { status: 400 });
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!webhookSecret) {
      logStep("ERROR: STRIPE_WEBHOOK_SECRET not set");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      logStep("ERROR: Invalid signature", { error: err instanceof Error ? err.message : String(err) });
      return new Response(`Webhook signature verification failed`, { status: 400 });
    }

    logStep("Event received", { type: event.type, id: event.id });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout completed", { sessionId: session.id, customerId: session.customer });

        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const customerEmail = session.customer_email || (session.customer_details?.email);
          
          if (!customerEmail) {
            logStep("ERROR: No customer email found");
            break;
          }

          // Find user by email
          const { data: users, error: userError } = await supabaseClient.auth.admin.listUsers();
          if (userError) {
            logStep("ERROR: Failed to list users", { error: userError.message });
            break;
          }

          const user = users.users.find(u => u.email === customerEmail);
          if (!user) {
            logStep("ERROR: User not found", { email: customerEmail });
            break;
          }

          const productId = subscription.items.data[0].price.product as string;
          const plan = PRODUCT_PLANS[productId] || "basico";

          // Upsert subscription record
          const { error: upsertError } = await supabaseClient
            .from("subscriptions")
            .upsert({
              user_id: user.id,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscription.id,
              status: "active",
              plan,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              trial_ends_at: null,
              cancel_at_period_end: subscription.cancel_at_period_end,
            }, { onConflict: "user_id" });

          if (upsertError) {
            logStep("ERROR: Failed to upsert subscription", { error: upsertError.message });
          } else {
            logStep("Subscription created/updated", { userId: user.id, plan });
          }

          // Update profile status
          await supabaseClient
            .from("profiles")
            .update({ subscription_status: "active" })
            .eq("user_id", user.id);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription updated", { subscriptionId: subscription.id, status: subscription.status });

        const productId = subscription.items.data[0].price.product as string;
        const plan = PRODUCT_PLANS[productId] || "basico";

        const { error } = await supabaseClient
          .from("subscriptions")
          .update({
            status: subscription.status === "active" ? "active" : subscription.status,
            plan,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          logStep("ERROR: Failed to update subscription", { error: error.message });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription deleted", { subscriptionId: subscription.id });

        const { data: subData, error: findError } = await supabaseClient
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        if (findError || !subData) {
          logStep("ERROR: Subscription not found", { error: findError?.message });
          break;
        }

        const { error } = await supabaseClient
          .from("subscriptions")
          .update({
            status: "canceled",
            cancel_at_period_end: false,
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          logStep("ERROR: Failed to update subscription status", { error: error.message });
        }

        // Update profile status
        await supabaseClient
          .from("profiles")
          .update({ subscription_status: "inactive" })
          .eq("user_id", subData.user_id);

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Payment failed", { invoiceId: invoice.id, subscriptionId: invoice.subscription });

        if (invoice.subscription) {
          const { error } = await supabaseClient
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("stripe_subscription_id", invoice.subscription as string);

          if (error) {
            logStep("ERROR: Failed to update subscription status", { error: error.message });
          }
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
