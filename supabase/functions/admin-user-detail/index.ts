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

    const { userId } = await req.json();
    if (!userId) throw new Error("userId required");

    // Get profile
    const { data: profile } = await supabaseAdmin.from("profiles").select("*").eq("user_id", userId).maybeSingle();
    
    // Get subscription
    const { data: subscription } = await supabaseAdmin.from("subscriptions").select("*").eq("user_id", userId).maybeSingle();
    
    // Get auth user
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    // Get companies with feedbacks count
    const { data: companies } = await supabaseAdmin.from("companies").select("id, name, slug").eq("owner_id", userId);
    
    const companiesWithStats = await Promise.all(
      (companies || []).map(async (company) => {
        const { count: feedbacksCount } = await supabaseAdmin.from("feedbacks").select("*", { count: "exact", head: true }).eq("company_id", company.id);
        const { data: ratingData } = await supabaseAdmin.from("feedbacks").select("rating").eq("company_id", company.id);
        const ratings = ratingData?.map(f => f.rating) || [];
        const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
        return {
          ...company,
          feedbacks_count: feedbacksCount || 0,
          average_rating: avgRating,
        };
      })
    );

    return new Response(JSON.stringify({
      id: profile?.id,
      user_id: userId,
      name: profile?.full_name || profile?.restaurant_name || "-",
      email: authUser.user?.email || "-",
      phone: profile?.phone || "",
      status: subscription?.status || "trialing",
      plan: subscription?.plan || "basico",
      created_at: profile?.created_at,
      is_blocked: profile?.is_blocked || false,
      trial_ends_at: subscription?.trial_ends_at,
      stripe_customer_id: subscription?.stripe_customer_id,
      companies: companiesWithStats,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
