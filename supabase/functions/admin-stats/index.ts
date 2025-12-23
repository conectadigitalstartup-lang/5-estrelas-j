import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPER_ADMIN_EMAIL = "alexandrehugolb@gmail.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header provided" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      return new Response(JSON.stringify({ error: userError.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const email = userData.user?.email?.toLowerCase();
    if (!email || email !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Fetch all counts in parallel
    const [
      companiesResult,
      activeSubsResult,
      trialingResult,
      canceledResult,
      totalFeedbacksResult,
      positiveFeedbacksResult,
      negativeFeedbacksResult,
      clientsResult
    ] = await Promise.all([
      supabaseClient.from("companies").select("*", { count: "exact", head: true }),
      supabaseClient.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabaseClient.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "trialing"),
      supabaseClient.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "canceled"),
      supabaseClient.from("feedbacks").select("*", { count: "exact", head: true }),
      supabaseClient.from("feedbacks").select("*", { count: "exact", head: true }).gte("rating", 4),
      supabaseClient.from("feedbacks").select("*", { count: "exact", head: true }).lte("rating", 3),
      supabaseClient.from("companies").select(`
        id,
        name,
        created_at,
        owner_id
      `).order("created_at", { ascending: false }).limit(50)
    ]);

    // Fetch subscriptions for clients
    const ownerIds = clientsResult.data?.map(c => c.owner_id) || [];
    let subscriptionsMap: Record<string, { status: string; plan: string }> = {};
    let profilesMap: Record<string, { email: string }> = {};

    if (ownerIds.length > 0) {
      const [subsResult, profilesResult] = await Promise.all([
        supabaseClient.from("subscriptions").select("user_id, status, plan").in("user_id", ownerIds),
        supabaseClient.from("profiles").select("user_id, full_name").in("user_id", ownerIds)
      ]);

      if (subsResult.data) {
        subsResult.data.forEach(sub => {
          subscriptionsMap[sub.user_id] = { status: sub.status, plan: sub.plan || "basico" };
        });
      }

      if (profilesResult.data) {
        profilesResult.data.forEach(profile => {
          profilesMap[profile.user_id] = { email: profile.full_name || "" };
        });
      }
    }

    // Get user emails from auth
    const clients = clientsResult.data?.map(company => ({
      id: company.id,
      name: company.name,
      email: profilesMap[company.owner_id]?.email || "-",
      status: subscriptionsMap[company.owner_id]?.status || "trialing",
      plan: subscriptionsMap[company.owner_id]?.plan || "basico",
      created_at: company.created_at,
    })) || [];

    const activeCount = activeSubsResult.count ?? 0;
    const trialingCount = trialingResult.count ?? 0;

    return new Response(
      JSON.stringify({
        totalCompanies: companiesResult.count ?? 0,
        activeSubscriptions: activeCount,
        trialingSubscriptions: trialingCount,
        canceledSubscriptions: canceledResult.count ?? 0,
        totalFeedbacks: totalFeedbacksResult.count ?? 0,
        positiveFeedbacks: positiveFeedbacksResult.count ?? 0,
        negativeFeedbacks: negativeFeedbacksResult.count ?? 0,
        mrr: activeCount * 99,
        potentialRevenue: trialingCount * 99,
        clients,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
