import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

console.log("🚀 Edge Function send-confirmation-email (Auth Hook) iniciada");

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resend = new Resend(resendApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AuthHookPayload {
  user: {
    id: string;
    email: string;
    user_metadata: {
      restaurant_name?: string;
    };
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log("📨 Requisição recebida:", req.method);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: AuthHookPayload = await req.json();
    console.log("📋 Payload recebido:", JSON.stringify(payload, null, 2));
    
    const { user, email_data } = payload;
    const email = user.email;
    const restaurantName = user.user_metadata?.restaurant_name || "seu restaurante";
    
    // Build the confirmation URL
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const confirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${email_data.token_hash}&type=${email_data.email_action_type}&redirect_to=${encodeURIComponent(email_data.redirect_to || email_data.site_url)}`;
    
    console.log("📧 Enviando email de confirmação para:", email);
    console.log("🔗 URL de confirmação:", confirmationUrl);

    const emailResponse = await resend.emails.send({
      from: "Avalia Pro <onboarding@resend.dev>",
      to: [email],
      subject: "🎉 Confirme seu cadastro no Avalia Pro",
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                        ⭐ Avalia Pro
                      </h1>
                      <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                        A sua máquina de reviews 5 estrelas
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 24px; font-weight: 600; text-align: center;">
                        🎉 Parabéns! Seu cadastro foi realizado!
                      </h2>
                      
                      <p style="margin: 0 0 15px 0; color: #475569; font-size: 16px; line-height: 1.6; text-align: center;">
                        Olá! Estamos muito felizes em ter <strong>${restaurantName}</strong> conosco.
                      </p>
                      
                      <p style="margin: 0 0 30px 0; color: #475569; font-size: 16px; line-height: 1.6; text-align: center;">
                        Para ativar sua conta e começar a transformar seus clientes satisfeitos em avaliações 5 estrelas no Google, clique no botão abaixo:
                      </p>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 10px 0 30px 0;">
                            <a href="${confirmationUrl}" 
                               style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(249, 115, 22, 0.4);">
                              ✅ Ativar minha conta
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Separator -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="border-top: 1px solid #e2e8f0; padding-top: 25px;">
                            <p style="margin: 0 0 10px 0; color: #64748b; font-size: 13px; text-align: center;">
                              Caso o botão não funcione, copie e cole este link no seu navegador:
                            </p>
                            <p style="margin: 0; color: #f97316; font-size: 12px; word-break: break-all; text-align: center;">
                              ${confirmationUrl}
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Features Preview -->
                  <tr>
                    <td style="background-color: #fff7ed; padding: 30px;">
                      <h3 style="margin: 0 0 20px 0; color: #1e293b; font-size: 16px; font-weight: 600; text-align: center;">
                        O que você vai encontrar:
                      </h3>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding: 8px 0; color: #475569; font-size: 14px;">
                            ✅ QR Code inteligente para capturar feedbacks
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #475569; font-size: 14px;">
                            ✅ Filtro automático: satisfeitos vão para o Google
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #475569; font-size: 14px;">
                            ✅ Dashboard com métricas de reputação
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #475569; font-size: 14px;">
                            ✅ 7 dias grátis para testar tudo!
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #1e293b; padding: 25px 30px; text-align: center;">
                      <p style="margin: 0 0 5px 0; color: #94a3b8; font-size: 12px;">
                        © 2025 Avalia Pro - Todos os direitos reservados
                      </p>
                      <p style="margin: 0; color: #64748b; font-size: 11px;">
                        Este email foi enviado porque você criou uma conta no Avalia Pro.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log("✅ Email de confirmação enviado com sucesso:", JSON.stringify(emailResponse));

    // Return empty response to indicate hook handled the email
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("❌ Erro na função send-confirmation-email:", error);
    return new Response(
      JSON.stringify({ 
        error: {
          http_code: 500,
          message: error.message 
        }
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
