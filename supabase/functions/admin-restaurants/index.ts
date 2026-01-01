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

    const { data: companies } = await supabaseAdmin.from("companies").select("id, name, slug, owner_id, created_at");
    const { data: profiles } = await supabaseAdmin.from("profiles").select("user_id, full_name, restaurant_name");
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();

    const restaurants = await Promise.all(
      (companies || []).map(async (company) => {
        const { count: feedbacksCount } = await supabaseAdmin.from("feedbacks").select("*", { count: "exact", head: true }).eq("company_id", company.id);
        const { data: ratingData } = await supabaseAdmin.from("feedbacks").select("rating").eq("company_id", company.id);
        const ratings = ratingData?.map(f => f.rating) || [];
        const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
        
        const profile = profiles?.find(p => p.user_id === company.owner_id);
        const authUser = authUsers?.users?.find(u => u.id === company.owner_id);

        return {
          id: company.id,
          name: company.name,
          slug: company.slug,
          owner_email: authUser?.email || "-",
          owner_name: profile?.full_name || profile?.restaurant_name || "-",
          feedbacks_count: feedbacksCount || 0,
          average_rating: avgRating,
          created_at: company.created_at,
        };
      })
    );

    return new Response(JSON.stringify({ restaurants }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
