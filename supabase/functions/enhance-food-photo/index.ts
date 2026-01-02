import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Plan limits for photo enhancements per month
const PLAN_LIMITS: Record<string, number> = {
  basico: 10,
  pro: 40,
  trialing: 10, // Trial users get basic limit
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Usuário não autenticado");
    }

    // Parse request body
    const body = await req.json();
    const { imageBase64, backgroundChoice, checkOnly } = body;

    // Create admin client
    const adminClient = createClient(
      SUPABASE_URL || "",
      SUPABASE_SERVICE_ROLE_KEY || ""
    );

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await adminClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Usuário não autenticado");
    }

    // Get subscription data
    const { data: sub, error: subError } = await adminClient
      .from("subscriptions")
      .select("status, plan, is_super_admin, photo_enhancements_count, photo_enhancements_reset_at")
      .eq("user_id", user.id)
      .single();

    if (subError) {
      console.error("Error fetching subscription:", subError);
      throw new Error("Erro ao verificar assinatura");
    }

    // Super admin has unlimited access
    const isSuperAdmin = sub?.is_super_admin === true;
    
    // Determine plan and limit
    const plan = sub?.plan || "basico";
    const status = sub?.status || "trialing";
    const limit = isSuperAdmin ? Infinity : (PLAN_LIMITS[plan] || PLAN_LIMITS.basico);

    // Check if we need to reset the counter (monthly reset)
    let currentCount = sub?.photo_enhancements_count || 0;
    const resetAt = sub?.photo_enhancements_reset_at ? new Date(sub.photo_enhancements_reset_at) : new Date();
    const now = new Date();
    
    // Reset if it's a new month
    const needsReset = resetAt.getMonth() !== now.getMonth() || resetAt.getFullYear() !== now.getFullYear();
    
    if (needsReset) {
      currentCount = 0;
      await adminClient
        .from("subscriptions")
        .update({ 
          photo_enhancements_count: 0,
          photo_enhancements_reset_at: now.toISOString()
        })
        .eq("user_id", user.id);
    }

    const remaining = isSuperAdmin ? Infinity : Math.max(0, limit - currentCount);

    // If this is just a check request, return the usage info
    if (checkOnly) {
      return new Response(JSON.stringify({
        used: currentCount,
        limit: isSuperAdmin ? -1 : limit, // -1 means unlimited
        remaining: isSuperAdmin ? -1 : remaining,
        plan,
        isSuperAdmin,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user has reached their limit
    if (!isSuperAdmin && currentCount >= limit) {
      return new Response(JSON.stringify({ 
        error: `Você atingiu o limite de ${limit} fotos/mês do plano ${plan === "pro" ? "Pro" : "Básico"}. Faça upgrade para continuar!`,
        limitReached: true,
        used: currentCount,
        limit,
        remaining: 0,
      }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!imageBase64) {
      throw new Error("Missing required parameter: imageBase64");
    }

    console.log("Processing food photo with background choice:", backgroundChoice);

    // Build the AI prompt based on background choice
    let prompt = "";
    
    if (backgroundChoice === "transparent") {
      prompt = "Remove the background from this food photo completely, leaving only the food/dish with a transparent background. Enhance the food's colors to look more appetizing - increase saturation slightly, improve lighting, and make it look professional and ready for a restaurant menu or Instagram post.";
    } else if (backgroundChoice === "white") {
      prompt = "Remove the cluttered background from this food photo and replace it with a clean, pure white background (#FFFFFF). Enhance the food's colors to look more appetizing - increase saturation slightly, improve lighting, add subtle shadows for depth, and make it look professional and ready for a restaurant menu or Instagram post.";
    } else if (backgroundChoice === "gray") {
      prompt = "Remove the cluttered background from this food photo and replace it with an elegant light gray background (#F0F0F0). Enhance the food's colors to look more appetizing - increase saturation slightly, improve lighting, add subtle shadows for depth, and make it look professional and ready for a restaurant menu or Instagram post.";
    } else if (backgroundChoice === "wood_light") {
      prompt = "Remove the cluttered background from this food photo and replace it with a beautiful rustic light wood texture surface, as if the plate is on a wooden restaurant table. Enhance the food's colors to look more appetizing - increase saturation slightly, improve lighting, add natural shadows, and make it look professional and ready for Instagram. The wood should look natural and warm.";
    } else if (backgroundChoice === "marble") {
      prompt = "Remove the cluttered background from this food photo and replace it with an elegant white marble surface texture with subtle gray veining. Enhance the food's colors to look more appetizing - increase saturation slightly, improve lighting, add subtle shadows, and make it look professional and ready for a high-end restaurant menu or Instagram post.";
    } else if (backgroundChoice === "wood_dark") {
      prompt = "Remove the cluttered background from this food photo and replace it with a sophisticated dark wood texture surface, creating a moody, upscale restaurant atmosphere. Enhance the food's colors to look more appetizing - increase saturation slightly, improve dramatic lighting with subtle highlights, add natural shadows, and make it look professional and ready for Instagram.";
    } else {
      prompt = "Enhance this food photo to look more professional and appetizing. Improve lighting, increase color saturation slightly, improve sharpness, and make it look ready for a restaurant menu or Instagram post.";
    }

    console.log("Sending request to AI gateway...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao seu workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao processar a imagem. Tente novamente." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    console.log("AI response received");

    // Extract the generated image
    const enhancedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!enhancedImageUrl) {
      console.error("No image in response:", JSON.stringify(data));
      throw new Error("A IA não retornou uma imagem. Tente novamente.");
    }

    // Increment the photo enhancements counter
    const newCount = currentCount + 1;
    await adminClient
      .from("subscriptions")
      .update({ 
        photo_enhancements_count: newCount
      })
      .eq("user_id", user.id);

    return new Response(JSON.stringify({ 
      enhancedImageUrl,
      message: "Foto processada com sucesso!",
      used: newCount,
      limit: isSuperAdmin ? -1 : limit,
      remaining: isSuperAdmin ? -1 : Math.max(0, limit - newCount),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in enhance-food-photo:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
