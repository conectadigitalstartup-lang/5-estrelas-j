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
        JSON.stringify({ 
          performance_data: [], 
          monthly_comparison: [],
          kpis: { positive_this_month: 0, negative_this_month: 0 } 
        }),
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

    // Calculate KPIs for current month and previous month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    let positiveThisMonth = 0;
    let negativeThisMonth = 0;

    // Group by month for comparison
    const monthlyData: { [key: string]: { ratings: number[], count: number } } = {};

    for (const feedback of feedbacks) {
      const feedbackDate = new Date(feedback.created_at);
      const monthKey = `${feedbackDate.getFullYear()}-${String(feedbackDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { ratings: [], count: 0 };
      }
      monthlyData[monthKey].ratings.push(feedback.rating);
      monthlyData[monthKey].count++;

      // Current month KPIs
      if (feedbackDate.getMonth() === currentMonth && feedbackDate.getFullYear() === currentYear) {
        if (feedback.rating > 3) {
          positiveThisMonth++;
        } else {
          negativeThisMonth++;
        }
      }
    }

    // Calculate monthly averages for comparison chart
    const monthlyComparison = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        average_rating: data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length,
        total_feedbacks: data.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Calculate trend line (simple linear regression)
    const calculateTrendLine = (data: { date: string; average_rating: number }[]) => {
      if (data.length < 2) return [];
      
      const n = data.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
      
      data.forEach((point, index) => {
        sumX += index;
        sumY += point.average_rating;
        sumXY += index * point.average_rating;
        sumX2 += index * index;
      });
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      return data.map((point, index) => ({
        date: point.date,
        trend: Math.max(1, Math.min(5, intercept + slope * index)),
      }));
    };

    const trendData = calculateTrendLine(performanceData);

    // Merge performance data with trend
    const performanceWithTrend = performanceData.map((item, index) => ({
      ...item,
      trend: trendData[index]?.trend || null,
    }));

    console.log(`✅ Performance data calculada: ${performanceData.length} dias, ${monthlyComparison.length} meses, KPIs: +${positiveThisMonth} -${negativeThisMonth}`);

    return new Response(
      JSON.stringify({
        performance_data: performanceWithTrend,
        monthly_comparison: monthlyComparison,
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
