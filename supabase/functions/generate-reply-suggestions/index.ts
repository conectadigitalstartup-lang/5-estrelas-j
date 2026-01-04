import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, rating, company } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!text || rating === undefined) {
      throw new Error("Missing required parameters: text and rating");
    }

    // Build company context if available
    let companyContext = "";
    if (company) {
      const parts = [];
      if (company.name) {
        parts.push(`Nome do estabelecimento: "${company.name}"`);
      }
      if (company.restaurant_type) {
        parts.push(`Tipo de negócio: ${company.restaurant_type}`);
      }
      if (company.current_google_rating) {
        parts.push(`Nota atual no Google: ${company.current_google_rating}/5`);
      }
      if (company.current_google_ratings_total) {
        parts.push(`Total de avaliações no Google: ${company.current_google_ratings_total}`);
      }
      if (parts.length > 0) {
        companyContext = `\n\n**DADOS DO ESTABELECIMENTO:**\n${parts.join("\n")}`;
      }
    }

    const systemPrompt = `**PERSONA:** Você é um especialista em atendimento ao cliente para pequenos negócios de alimentação (restaurantes, docerias, bares, cafeterias, padarias). Sua linguagem é amigável, acolhedora e profissional, sempre em português do Brasil.${companyContext}

**CONTEXTO DO FEEDBACK:** 
- Nota da avaliação: **${rating}** de 5 estrelas
- Comentário do cliente: "${text}"

**TAREFA:** Gere 3 opções de resposta personalizadas para o dono do negócio responder a este cliente. As respostas devem:
- Ser curtas, diretas e apropriadas para o tom do feedback
- Mencionar o nome do estabelecimento quando apropriado para personalizar
- Considerar o tipo de negócio para sugerir produtos/experiências relevantes

**REGRAS PARA AS RESPOSTAS:**
- **Nota 4 ou 5 (positiva):** Agradeça com entusiasmo, celebre o elogio específico mencionado e convide para voltar. Se o cliente elogiou algo específico (um prato, o atendimento), mencione isso na resposta.
- **Nota 3 (neutra):** Agradeça pelo feedback honesto, mostre que a opinião é valorizada para melhorar continuamente.
- **Nota 1 ou 2 (negativa):** Peça desculpas sinceramente pela experiência negativa, mostre empatia genuína, ofereça resolver a situação e convide para uma nova chance. NUNCA seja defensivo.

**Gere exatamente 3 opções com tons distintos:**
1. **Amigável e Curta:** Resposta rápida, informal, calorosa (2-3 linhas).
2. **Profissional e Agradecida:** Resposta mais formal, agradecendo pelo tempo e opinião (3-4 linhas).
3. **Vendedora e Convidativa:** Resposta que, além de agradecer/pedir desculpas, incentiva uma próxima visita ou sugere experimentar outro produto/serviço (3-4 linhas).

**FORMATO DA SAÍDA:** Retorne APENAS um objeto JSON válido com as chaves: "amigavel", "profissional", "vendedora". Sem texto antes ou depois do JSON.`;

    console.log("Generating reply suggestions for rating:", rating, "company:", company?.name);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Gere as 3 sugestões de resposta personalizadas para o feedback acima. Retorne apenas o JSON.` }
        ],
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
      return new Response(JSON.stringify({ error: "Erro ao gerar sugestões" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("AI response content:", content);

    // Parse the JSON from the response
    let suggestions;
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        suggestions = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response as JSON");
    }

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-reply-suggestions:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
