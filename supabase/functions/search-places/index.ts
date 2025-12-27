import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

console.log("🚀 Edge Function search-places iniciada");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  google_maps_url: string;
  rating?: number;
  user_ratings_total?: number;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("📨 Requisição recebida:", req.method);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { query, place_id } = body;

    const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
    if (!apiKey) {
      console.error("❌ GOOGLE_PLACES_API_KEY não configurada");
      return new Response(
        JSON.stringify({ error: "API Key não configurada" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // If place_id is provided, fetch Place Details
    if (place_id) {
      console.log("🔍 Buscando detalhes do place:", place_id);

      const detailsUrl = new URL("https://maps.googleapis.com/maps/api/place/details/json");
      detailsUrl.searchParams.set("place_id", place_id);
      detailsUrl.searchParams.set("fields", "name,formatted_address,rating,user_ratings_total");
      detailsUrl.searchParams.set("language", "pt-BR");
      detailsUrl.searchParams.set("key", apiKey);

      console.log("📡 Chamando Google Place Details API...");
      const response = await fetch(detailsUrl.toString());
      const data = await response.json();

      if (data.status !== "OK") {
        console.error("❌ Erro na API do Google:", data.status, data.error_message);
        return new Response(
          JSON.stringify({ error: `Erro ao buscar detalhes: ${data.status}` }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const details = {
        place_id: place_id,
        name: data.result.name,
        formatted_address: data.result.formatted_address,
        rating: data.result.rating || null,
        user_ratings_total: data.result.user_ratings_total || null,
      };

      console.log(`✅ Detalhes encontrados:`, details);

      return new Response(
        JSON.stringify({ details }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Otherwise, search for places
    if (!query || query.length < 3) {
      return new Response(
        JSON.stringify({ results: [], error: "Query muito curta" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("🔍 Buscando:", query);

    // Usar Text Search para buscar restaurantes
    const searchUrl = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
    searchUrl.searchParams.set("query", `${query} restaurante`);
    searchUrl.searchParams.set("type", "restaurant");
    searchUrl.searchParams.set("language", "pt-BR");
    searchUrl.searchParams.set("key", apiKey);

    console.log("📡 Chamando Google Places API...");
    const response = await fetch(searchUrl.toString());
    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("❌ Erro na API do Google:", data.status, data.error_message);
      return new Response(
        JSON.stringify({ error: `Erro na busca: ${data.status}` }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const results: PlaceResult[] = (data.results || []).slice(0, 5).map((place: any) => ({
      place_id: place.place_id,
      name: place.name,
      formatted_address: place.formatted_address,
      google_maps_url: `https://search.google.com/local/writereview?placeid=${place.place_id}`,
      rating: place.rating || null,
      user_ratings_total: place.user_ratings_total || null,
    }));

    console.log(`✅ Encontrados ${results.length} resultados`);

    return new Response(
      JSON.stringify({ results }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("❌ Erro na função search-places:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
