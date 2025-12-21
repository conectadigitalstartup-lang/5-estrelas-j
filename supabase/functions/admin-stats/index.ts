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

    const [{ count: totalCompanies, error: companiesError }, { count: activeSubscriptions, error: subsError }, { count: totalFeedbacks, error: feedbacksError }] =
      await Promise.all([
        supabaseClient.from("companies").select("*", { count: "exact", head: true }),
        supabaseClient
          .from("subscriptions")
          .select("*", { count: "exact", head: true })
          .in("status", ["active", "trialing"]),
        supabaseClient.from("feedbacks").select("*", { count: "exact", head: true }),
      ]);

    if (companiesError) throw companiesError;
    if (subsError) throw subsError;
    if (feedbacksError) throw feedbacksError;

    return new Response(
      JSON.stringify({
        totalCompanies: totalCompanies ?? 0,
        activeSubscriptions: activeSubscriptions ?? 0,
        totalFeedbacks: totalFeedbacks ?? 0,
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
