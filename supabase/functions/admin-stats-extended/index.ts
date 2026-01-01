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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Verify super admin
    const { data: subData } = await supabaseClient
      .from("subscriptions")
      .select("is_super_admin")
      .eq("user_id", userData.user.id)
      .single();

    if (!subData?.is_super_admin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Fetch all counts in parallel
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      companiesResult,
      activeSubsResult,
      trialingResult,
      canceledResult,
      totalFeedbacksResult,
      recentSignupsResult,
      recentCancellationsResult,
      last30DaysSubsResult
    ] = await Promise.all([
      supabaseClient.from("companies").select("*", { count: "exact", head: true }),
      supabaseClient.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabaseClient.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "trialing"),
      supabaseClient.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "canceled"),
      supabaseClient.from("feedbacks").select("*", { count: "exact", head: true }),
      // Recent signups - profiles created in last 7 days
      supabaseClient
        .from("profiles")
        .select("user_id, full_name, restaurant_name, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      // Recent cancellations
      supabaseClient
        .from("subscriptions")
        .select("user_id, updated_at")
        .eq("status", "canceled")
        .order("updated_at", { ascending: false })
        .limit(5),
      // All subscriptions created in last 30 days for chart
      supabaseClient
        .from("subscriptions")
        .select("created_at")
        .gte("created_at", thirtyDaysAgo.toISOString())
    ]);

    // Get user emails for recent signups and cancellations
    const signupUserIds = recentSignupsResult.data?.map(p => p.user_id) || [];
    const cancelUserIds = recentCancellationsResult.data?.map(s => s.user_id) || [];
    const allUserIds = [...new Set([...signupUserIds, ...cancelUserIds])];

    let userEmails: Record<string, string> = {};
    if (allUserIds.length > 0) {
      const { data: authData } = await supabaseClient.auth.admin.listUsers();
      if (authData?.users) {
        authData.users.forEach(u => {
          userEmails[u.id] = u.email || "";
        });
      }
    }

    // Format recent signups
    const recentSignups = recentSignupsResult.data?.map(p => ({
      name: p.restaurant_name || p.full_name || "Sem nome",
      email: userEmails[p.user_id] || "-",
      date: new Date(p.created_at).toLocaleDateString("pt-BR"),
    })) || [];

    // Format recent cancellations  
    const recentCancellations = await Promise.all(
      (recentCancellationsResult.data || []).map(async (s) => {
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("full_name, restaurant_name")
          .eq("user_id", s.user_id)
          .single();
        
        return {
          name: profile?.restaurant_name || profile?.full_name || "Sem nome",
          email: userEmails[s.user_id] || "-",
          date: new Date(s.updated_at).toLocaleDateString("pt-BR"),
        };
      })
    );

    // Calculate signups per day for last 30 days
    const signupsPerDay: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      signupsPerDay[dateStr] = 0;
    }

    last30DaysSubsResult.data?.forEach(sub => {
      const date = new Date(sub.created_at);
      const dateStr = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      if (signupsPerDay[dateStr] !== undefined) {
        signupsPerDay[dateStr]++;
      }
    });

    const signupsLast30Days = Object.entries(signupsPerDay).map(([date, count]) => ({
      date,
      count,
    }));

    const activeCount = activeSubsResult.count ?? 0;

    return new Response(
      JSON.stringify({
        totalCompanies: companiesResult.count ?? 0,
        activeSubscriptions: activeCount,
        trialingSubscriptions: trialingResult.count ?? 0,
        canceledSubscriptions: canceledResult.count ?? 0,
        totalFeedbacks: totalFeedbacksResult.count ?? 0,
        mrr: activeCount * 99,
        recentSignups,
        recentCancellations,
        signupsLast30Days,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Admin stats extended error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
