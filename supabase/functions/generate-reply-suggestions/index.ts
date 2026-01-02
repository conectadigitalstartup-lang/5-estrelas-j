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
    const { text, rating } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!text || rating === undefined) {
      throw new Error("Missing required parameters: text and rating");
    }

    const systemPrompt = `**PERSONA:** Você é um especialista em atendimento ao cliente para pequenos negócios de alimentação (restaurantes, docerias, bares). Sua linguagem é amigável, acolhedora e profissional, sempre em português do Brasil.

**CONTEXTO:** Você recebeu um feedback de um cliente. A nota da avaliação foi **${rating}** de 5. O comentário do cliente foi: "${text}".

**TAREFA:** Seu trabalho é gerar 3 opções de resposta para o dono do negócio responder a este cliente. As respostas devem ser curtas, diretas e apropriadas para o tom do feedback.

**REGRAS PARA AS RESPOSTAS:**
- **Se a nota for 4 ou 5 (positiva):** Foque em agradecer, celebrar e convidar o cliente a voltar.
- **Se a nota for 3 (neutra):** Agradeça o feedback e mostre que a opinião é importante para melhorar.
- **Se a nota for 1 ou 2 (negativa):** Peça desculpas sinceramente pela experiência, mostre preocupação e, se possível, convide para uma nova chance, sem ser defensivo.

**Gere exatamente 3 opções com os seguintes tons distintos:**
1. **Amigável e Curta:** Uma resposta rápida, informal e calorosa.
2. **Profissional e Agradecida:** Uma resposta um pouco mais formal, que agradece pelo tempo e pela opinião do cliente.
3. **Vendedora e Convidativa:** Uma resposta que, além de agradecer, tenta incentivar uma próxima visita ou sugere outro produto.

**FORMATO DA SAÍDA:** Retorne APENAS um objeto JSON válido contendo as três respostas, com as seguintes chaves: "amigavel", "profissional", "vendedora". Não inclua nenhum texto antes ou depois do JSON.`;

    console.log("Generating reply suggestions for rating:", rating);

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
          { role: "user", content: `Gere as 3 sugestões de resposta para o feedback acima. Retorne apenas o JSON.` }
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
