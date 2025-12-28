import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("🚀 Edge Function update-google-ratings iniciada");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("📨 Requisição recebida:", req.method);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!apiKey) {
      console.error("❌ GOOGLE_PLACES_API_KEY não configurada");
      return new Response(
        JSON.stringify({ error: "API Key não configurada" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Supabase credentials não configuradas");
      return new Response(
        JSON.stringify({ error: "Supabase credentials não configuradas" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all companies with a google_place_id
    const { data: companies, error: fetchError } = await supabase
      .from("companies")
      .select("id, name, google_place_id")
      .not("google_place_id", "is", null);

    if (fetchError) {
      console.error("❌ Erro ao buscar empresas:", fetchError);
      return new Response(
        JSON.stringify({ error: "Erro ao buscar empresas" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`📊 Encontradas ${companies?.length || 0} empresas para atualizar`);

    let updated = 0;
    let failed = 0;

    for (const company of companies || []) {
      try {
        console.log(`🔄 Atualizando: ${company.name} (${company.google_place_id})`);

        // Call Google Place Details API
        const detailsUrl = new URL("https://maps.googleapis.com/maps/api/place/details/json");
        detailsUrl.searchParams.set("place_id", company.google_place_id);
        detailsUrl.searchParams.set("fields", "rating,user_ratings_total");
        detailsUrl.searchParams.set("language", "pt-BR");
        detailsUrl.searchParams.set("key", apiKey);

        const response = await fetch(detailsUrl.toString());
        const data = await response.json();

        if (data.status !== "OK") {
          console.error(`❌ Erro na API do Google para ${company.name}:`, data.status);
          failed++;
          continue;
        }

        const rating = data.result?.rating || null;
        const userRatingsTotal = data.result?.user_ratings_total || null;

        // Update ONLY current ratings (preserve initial values)
        const { error: updateError } = await supabase
          .from("companies")
          .update({
            current_google_rating: rating,
            current_google_ratings_total: userRatingsTotal,
            google_rating: rating,
            google_user_ratings_total: userRatingsTotal,
            updated_at: new Date().toISOString(),
          })
          .eq("id", company.id);

        if (updateError) {
          console.error(`❌ Erro ao atualizar ${company.name}:`, updateError);
          failed++;
        } else {
          console.log(`✅ ${company.name}: rating=${rating}, total=${userRatingsTotal}`);
          updated++;
        }

        // Small delay to avoid rate limiting from Google API
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (err) {
        console.error(`❌ Erro ao processar ${company.name}:`, err);
        failed++;
      }
    }

    console.log(`📊 Resultado: ${updated} atualizados, ${failed} falharam`);

    return new Response(
      JSON.stringify({
        success: true,
        updated,
        failed,
        total: companies?.length || 0,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("❌ Erro na função update-google-ratings:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
