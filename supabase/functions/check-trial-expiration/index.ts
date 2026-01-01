import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("🚀 Edge Function check-trial-expiration iniciada");

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const resend = new Resend(resendApiKey);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const sendExpirationEmail = async (
  email: string,
  restaurantName: string,
  daysLeft: number
) => {
  const subject = daysLeft === 3 
    ? `⏰ Faltam ${daysLeft} dias para seu teste acabar - Avalia Pro`
    : `🚨 Seu teste acaba amanhã! - Avalia Pro`;

  const urgencyText = daysLeft === 3
    ? "Faltam apenas 3 dias para o fim do seu período de teste."
    : "Seu período de teste acaba amanhã!";

  const ctaText = daysLeft === 3
    ? "Assine agora e continue captando avaliações"
    : "Assine agora para não perder seu QR Code";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">⏰ ${urgencyText}</h1>
      </div>
      
      <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
        <p style="color: #374151; margin: 0 0 20px; font-size: 16px;">
          Olá${restaurantName ? `, <strong>${restaurantName}</strong>` : ""}!
        </p>
        
        <div style="background: #fef3c7; padding: 20px; border-radius: 12px; border-left: 4px solid #f59e0b; margin-bottom: 25px;">
          <p style="color: #92400e; margin: 0; font-size: 15px;">
            <strong>⚠️ Importante:</strong> Após o término do teste, seu QR Code será desativado e seus clientes não conseguirão mais avaliar seu restaurante.
          </p>
        </div>

        <p style="color: #6b7280; margin: 0 0 25px; font-size: 15px;">
          Não perca todas as avaliações que você já conquistou! Assine agora e mantenha seu canal de feedback ativo.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://avaliapro.com.br/dashboard/upgrade" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
            ${ctaText}
          </a>
        </div>

        <ul style="color: #6b7280; font-size: 14px; padding-left: 20px;">
          <li style="margin-bottom: 8px;">✓ QR Code sempre ativo</li>
          <li style="margin-bottom: 8px;">✓ Feedbacks ilimitados</li>
          <li style="margin-bottom: 8px;">✓ Painel de controle completo</li>
          <li style="margin-bottom: 0;">✓ Suporte prioritário</li>
        </ul>
      </div>
      
      <div style="text-align: center; padding: 25px 20px; color: #9ca3af; font-size: 12px;">
        <p style="margin: 0;">© 2024 Avalia Pro. Todos os direitos reservados.</p>
      </div>
    </body>
    </html>
  `;

  try {
    const result = await resend.emails.send({
      from: "Avalia Pro <onboarding@resend.dev>",
      to: [email],
      subject,
      html,
    });
    console.log(`✅ Email enviado para ${email} (${daysLeft} dias restantes)`, result);
    return { success: true };
  } catch (error) {
    console.error(`❌ Erro ao enviar email para ${email}:`, error);
    return { success: false, error };
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("📨 Requisição recebida:", req.method);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const now = new Date();
    
    // Buscar assinaturas em trial que expiram em 3 dias (faltam 3 dias)
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const threeDaysStart = new Date(threeDaysFromNow);
    threeDaysStart.setHours(0, 0, 0, 0);
    const threeDaysEnd = new Date(threeDaysFromNow);
    threeDaysEnd.setHours(23, 59, 59, 999);

    // Buscar assinaturas que expiram em 1 dia (amanhã)
    const oneDayFromNow = new Date(now);
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);
    const oneDayStart = new Date(oneDayFromNow);
    oneDayStart.setHours(0, 0, 0, 0);
    const oneDayEnd = new Date(oneDayFromNow);
    oneDayEnd.setHours(23, 59, 59, 999);

    console.log("📅 Verificando trials que expiram em 3 dias:", threeDaysStart.toISOString(), "-", threeDaysEnd.toISOString());
    console.log("📅 Verificando trials que expiram em 1 dia:", oneDayStart.toISOString(), "-", oneDayEnd.toISOString());

    // Buscar subscriptions em trial com trial_ends_at em 3 dias
    const { data: threeDaysSubs, error: error3 } = await supabase
      .from("subscriptions")
      .select("user_id, trial_ends_at")
      .eq("status", "trialing")
      .gte("trial_ends_at", threeDaysStart.toISOString())
      .lte("trial_ends_at", threeDaysEnd.toISOString());

    if (error3) console.error("Erro ao buscar subs 3 dias:", error3);

    // Buscar subscriptions em trial com trial_ends_at em 1 dia
    const { data: oneDaySubs, error: error1 } = await supabase
      .from("subscriptions")
      .select("user_id, trial_ends_at")
      .eq("status", "trialing")
      .gte("trial_ends_at", oneDayStart.toISOString())
      .lte("trial_ends_at", oneDayEnd.toISOString());

    if (error1) console.error("Erro ao buscar subs 1 dia:", error1);

    const results = {
      threeDaysEmails: 0,
      oneDayEmails: 0,
      errors: 0,
    };

    // Enviar emails para trials que expiram em 3 dias
    for (const sub of threeDaysSubs || []) {
      // Buscar email e nome do restaurante
      const { data: userData } = await supabase.auth.admin.getUserById(sub.user_id);
      const { data: company } = await supabase
        .from("companies")
        .select("name")
        .eq("owner_id", sub.user_id)
        .maybeSingle();

      if (userData?.user?.email) {
        const result = await sendExpirationEmail(
          userData.user.email,
          company?.name || "",
          3
        );
        if (result.success) {
          results.threeDaysEmails++;
        } else {
          results.errors++;
        }
      }
    }

    // Enviar emails para trials que expiram amanhã
    for (const sub of oneDaySubs || []) {
      const { data: userData } = await supabase.auth.admin.getUserById(sub.user_id);
      const { data: company } = await supabase
        .from("companies")
        .select("name")
        .eq("owner_id", sub.user_id)
        .maybeSingle();

      if (userData?.user?.email) {
        const result = await sendExpirationEmail(
          userData.user.email,
          company?.name || "",
          1
        );
        if (result.success) {
          results.oneDayEmails++;
        } else {
          results.errors++;
        }
      }
    }

    console.log("🏁 Processamento concluído:", results);

    return new Response(JSON.stringify({ 
      success: true, 
      ...results,
      message: `Enviados: ${results.threeDaysEmails} emails (3 dias) + ${results.oneDayEmails} emails (1 dia). Erros: ${results.errors}`
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("❌ Erro na função check-trial-expiration:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);