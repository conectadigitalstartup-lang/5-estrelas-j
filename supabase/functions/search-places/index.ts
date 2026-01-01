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
    const { query, place_id, google_maps_url } = body;
    console.log("📥 Body recebido:", JSON.stringify({ query, place_id, google_maps_url }));

    const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
    if (!apiKey) {
      console.error("❌ GOOGLE_PLACES_API_KEY não configurada no ambiente");
      return new Response(
        JSON.stringify({ error: "API Key não configurada" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    console.log("✅ GOOGLE_PLACES_API_KEY encontrada");

    // Extract place_id from Google Maps URL if provided
    if (google_maps_url) {
      console.log("🔗 Extraindo place_id da URL:", google_maps_url);
      
      // Try to extract place_id from various Google Maps URL formats
      let extractedPlaceId: string | null = null;
      
      // Format: https://www.google.com/maps/place/.../data=...!1s0x...!3m1!1s...
      // Format: https://maps.google.com/?cid=...
      // Format: https://www.google.com/maps?cid=...
      // Format: https://search.google.com/local/writereview?placeid=...
      
      // Try placeid parameter
      const placeidMatch = google_maps_url.match(/placeid=([^&]+)/i);
      if (placeidMatch) {
        extractedPlaceId = placeidMatch[1];
      }
      
      // Try cid parameter (Customer ID)
      if (!extractedPlaceId) {
        const cidMatch = google_maps_url.match(/cid=(\d+)/i);
        if (cidMatch) {
          // CID needs to be converted, we'll use Find Place instead
          console.log("📍 CID encontrado, buscando via Find Place...");
        }
      }
      
      // Try to find place using the URL content
      if (!extractedPlaceId) {
        // Extract place name from URL for search
        const placeNameMatch = google_maps_url.match(/place\/([^\/]+)/);
        if (placeNameMatch) {
          const placeName = decodeURIComponent(placeNameMatch[1].replace(/\+/g, ' '));
          console.log("📍 Nome extraído da URL:", placeName);
          
          // Use Find Place API to get place_id
          const findUrl = new URL("https://maps.googleapis.com/maps/api/place/findplacefromtext/json");
          findUrl.searchParams.set("input", placeName);
          findUrl.searchParams.set("inputtype", "textquery");
          findUrl.searchParams.set("fields", "place_id,name,formatted_address,rating,user_ratings_total");
          findUrl.searchParams.set("language", "pt-BR");
          findUrl.searchParams.set("key", apiKey);
          
          const findResponse = await fetch(findUrl.toString());
          const findData = await findResponse.json();
          
          if (findData.status === "OK" && findData.candidates?.length > 0) {
            const candidate = findData.candidates[0];
            const result: PlaceResult = {
              place_id: candidate.place_id,
              name: candidate.name,
              formatted_address: candidate.formatted_address,
              google_maps_url: `https://search.google.com/local/writereview?placeid=${candidate.place_id}`,
              rating: candidate.rating || null,
              user_ratings_total: candidate.user_ratings_total || null,
            };
            
            console.log("✅ Lugar encontrado via URL:", result.name);
            return new Response(
              JSON.stringify({ result }),
              { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
            );
          }
        }
      }
      
      if (extractedPlaceId) {
        // Fetch details for the extracted place_id
        const detailsUrl = new URL("https://maps.googleapis.com/maps/api/place/details/json");
        detailsUrl.searchParams.set("place_id", extractedPlaceId);
        detailsUrl.searchParams.set("fields", "place_id,name,formatted_address,rating,user_ratings_total");
        detailsUrl.searchParams.set("language", "pt-BR");
        detailsUrl.searchParams.set("key", apiKey);
        
        const detailsResponse = await fetch(detailsUrl.toString());
        const detailsData = await detailsResponse.json();
        
        if (detailsData.status === "OK") {
          const result: PlaceResult = {
            place_id: detailsData.result.place_id || extractedPlaceId,
            name: detailsData.result.name,
            formatted_address: detailsData.result.formatted_address,
            google_maps_url: `https://search.google.com/local/writereview?placeid=${extractedPlaceId}`,
            rating: detailsData.result.rating || null,
            user_ratings_total: detailsData.result.user_ratings_total || null,
          };
          
          console.log("✅ Lugar encontrado via place_id:", result.name);
          return new Response(
            JSON.stringify({ result }),
            { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
      }
      
      return new Response(
        JSON.stringify({ error: "Não foi possível extrair informações desta URL. Tente copiar o link diretamente do Google Maps." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // If place_id is provided, fetch Place Details
    if (place_id) {
      console.log("🔍 Buscando detalhes do place:", place_id);

      try {
        const detailsUrl = new URL("https://maps.googleapis.com/maps/api/place/details/json");
        detailsUrl.searchParams.set("place_id", place_id);
        detailsUrl.searchParams.set("fields", "name,formatted_address,rating,user_ratings_total");
        detailsUrl.searchParams.set("language", "pt-BR");
        detailsUrl.searchParams.set("key", apiKey);

        console.log("📡 Chamando Google Place Details API...");
        const response = await fetch(detailsUrl.toString());
        const data = await response.json();

        console.log("📦 Resposta da API Google Details:", JSON.stringify(data));

        if (data.status !== "OK") {
          console.error("❌ Erro na API do Google:", data.status, data.error_message);
          return new Response(
            JSON.stringify({ error: `Erro ao buscar detalhes: ${data.status}`, details: data.error_message }),
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

        console.log(`✅ Detalhes encontrados:`, JSON.stringify(details));

        return new Response(
          JSON.stringify({ details }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      } catch (fetchError: any) {
        console.error("❌ ERRO AO CHAMAR API DO GOOGLE (details):", fetchError.message);
        return new Response(
          JSON.stringify({ error: "Erro na chamada à API do Google", message: fetchError.message }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Otherwise, search for places
    if (!query || query.length < 3) {
      return new Response(
        JSON.stringify({ results: [], error: "Query muito curta" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("🔍 Buscando:", query);

    try {
      // Usar Text Search SEM restrição de tipo para encontrar qualquer estabelecimento
      const searchUrl = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
      searchUrl.searchParams.set("query", query);
      searchUrl.searchParams.set("language", "pt-BR");
      searchUrl.searchParams.set("key", apiKey);

      console.log("📡 Chamando Google Places API (text search)...");
      const response = await fetch(searchUrl.toString());
      const data = await response.json();

      console.log("📦 Resposta da API Google Search - status:", data.status, "- resultados:", data.results?.length || 0);

      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        console.error("❌ Erro na API do Google:", data.status, data.error_message);
        return new Response(
          JSON.stringify({ error: `Erro na busca: ${data.status}`, details: data.error_message }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const results: PlaceResult[] = (data.results || []).slice(0, 8).map((place: any) => ({
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
    } catch (fetchError: any) {
      console.error("❌ ERRO AO CHAMAR API DO GOOGLE (search):", fetchError.message);
      return new Response(
        JSON.stringify({ error: "Erro na chamada à API do Google", message: fetchError.message }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
  } catch (error: any) {
    console.error("❌ Erro na função search-places:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
