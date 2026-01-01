import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const { action, userId } = await req.json();

    // Verify admin status
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseAdmin.auth.getUser(token);
    
    const { data: adminCheck } = await supabaseAdmin
      .from("subscriptions")
      .select("is_super_admin")
      .eq("user_id", userData.user?.id)
      .single();
    
    if (!adminCheck?.is_super_admin) throw new Error("Forbidden");

    switch (action) {
      case "block":
        await supabaseAdmin.from("profiles").update({ is_blocked: true }).eq("user_id", userId);
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

      case "unblock":
        await supabaseAdmin.from("profiles").update({ is_blocked: false }).eq("user_id", userId);
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

      case "delete":
        // Delete feedbacks, companies, profiles, subscriptions, then auth user
        const { data: companies } = await supabaseAdmin.from("companies").select("id").eq("owner_id", userId);
        if (companies) {
          for (const company of companies) {
            await supabaseAdmin.from("feedbacks").delete().eq("company_id", company.id);
          }
        }
        await supabaseAdmin.from("companies").delete().eq("owner_id", userId);
        await supabaseAdmin.from("subscriptions").delete().eq("user_id", userId);
        await supabaseAdmin.from("profiles").delete().eq("user_id", userId);
        await supabaseAdmin.auth.admin.deleteUser(userId);
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

      default:
        throw new Error("Invalid action");
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
