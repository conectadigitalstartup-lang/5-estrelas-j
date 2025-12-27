import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("🚀 Edge Function get-performance-data iniciada");

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { company_id } = await req.json();

    if (!company_id) {
      console.error("❌ company_id não fornecido");
      return new Response(
        JSON.stringify({ error: "company_id é obrigatório" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("🔍 Buscando feedbacks para company_id:", company_id);

    // Fetch all feedbacks for this company
    const { data: feedbacks, error } = await supabase
      .from("feedbacks")
      .select("rating, created_at")
      .eq("company_id", company_id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("❌ Erro ao buscar feedbacks:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!feedbacks || feedbacks.length === 0) {
      console.log("📊 Nenhum feedback encontrado");
      return new Response(
        JSON.stringify({ performance_data: [], kpis: { positive_this_month: 0, negative_this_month: 0 } }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`📊 Encontrados ${feedbacks.length} feedbacks`);

    // Group feedbacks by date and calculate average
    const groupedByDate: { [key: string]: number[] } = {};
    
    for (const feedback of feedbacks) {
      const date = feedback.created_at.split("T")[0]; // Get YYYY-MM-DD
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      groupedByDate[date].push(feedback.rating);
    }

    // Calculate average for each day
    const performanceData = Object.entries(groupedByDate)
      .map(([date, ratings]) => ({
        date,
        average_rating: ratings.reduce((sum, r) => sum + r, 0) / ratings.length,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate KPIs for current month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let positiveThisMonth = 0;
    let negativeThisMonth = 0;

    for (const feedback of feedbacks) {
      const feedbackDate = new Date(feedback.created_at);
      if (feedbackDate.getMonth() === currentMonth && feedbackDate.getFullYear() === currentYear) {
        if (feedback.rating > 3) {
          positiveThisMonth++;
        } else {
          negativeThisMonth++;
        }
      }
    }

    console.log(`✅ Performance data calculada: ${performanceData.length} dias, KPIs: +${positiveThisMonth} -${negativeThisMonth}`);

    return new Response(
      JSON.stringify({
        performance_data: performanceData,
        kpis: {
          positive_this_month: positiveThisMonth,
          negative_this_month: negativeThisMonth,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("❌ Erro na função get-performance-data:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
