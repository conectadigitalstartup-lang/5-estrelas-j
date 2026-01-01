import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseAdmin.auth.getUser(token);
    const { data: adminCheck } = await supabaseAdmin.from("subscriptions").select("is_super_admin").eq("user_id", userData.user?.id).maybeSingle();
    if (!adminCheck?.is_super_admin) throw new Error("Forbidden");

    const { data: subscriptions } = await supabaseAdmin.from("subscriptions").select("*").order("created_at", { ascending: false });
    const { data: profiles } = await supabaseAdmin.from("profiles").select("user_id, full_name, restaurant_name");
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();

    const subs = (subscriptions || []).map(sub => {
      const profile = profiles?.find(p => p.user_id === sub.user_id);
      const authUser = authUsers?.users?.find(u => u.id === sub.user_id);
      return {
        id: sub.id,
        user_id: sub.user_id,
        email: authUser?.email || "-",
        name: profile?.full_name || profile?.restaurant_name || "-",
        status: sub.status,
        plan: sub.plan || "basico",
        stripe_customer_id: sub.stripe_customer_id,
        stripe_subscription_id: sub.stripe_subscription_id,
        current_period_end: sub.current_period_end,
        created_at: sub.created_at,
      };
    });

    return new Response(JSON.stringify({ subscriptions: subs }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
