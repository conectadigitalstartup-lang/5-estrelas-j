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
    const { data: adminCheck } = await supabaseAdmin.from("subscriptions").select("is_super_admin").eq("user_id", userData.user?.id).single();
    if (!adminCheck?.is_super_admin) throw new Error("Forbidden");

    const { data: profiles } = await supabaseAdmin.from("profiles").select("user_id, full_name, restaurant_name, phone, created_at, is_blocked");
    const { data: subscriptions } = await supabaseAdmin.from("subscriptions").select("user_id, status, plan, stripe_customer_id");
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();

    const users = profiles?.map(p => {
      const sub = subscriptions?.find(s => s.user_id === p.user_id);
      const authUser = authUsers?.users?.find(u => u.id === p.user_id);
      return {
        id: p.user_id,
        user_id: p.user_id,
        name: p.full_name || p.restaurant_name || "-",
        email: authUser?.email || "-",
        status: sub?.status || "trialing",
        plan: sub?.plan || "basico",
        created_at: p.created_at,
        is_blocked: p.is_blocked || false,
      };
    }) || [];

    return new Response(JSON.stringify({ users }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
