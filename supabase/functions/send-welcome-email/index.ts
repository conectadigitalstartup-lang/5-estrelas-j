import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

console.log("🚀 Edge Function send-welcome-email iniciada");

const resendApiKey = Deno.env.get("RESEND_API_KEY");
console.log("📧 RESEND_API_KEY configurada:", resendApiKey ? "SIM" : "NÃO");

const resend = new Resend(resendApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  restaurantName: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("📨 Requisição recebida:", req.method);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, restaurantName }: WelcomeEmailRequest = await req.json();
    console.log("📋 Dados recebidos - email:", email, "restaurantName:", restaurantName);

    const emailResponse = await resend.emails.send({
      from: "Avalia Pro <onboarding@resend.dev>",
      to: [email],
      subject: "Bem-vindo ao Avalia Pro! 🎉",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Bem-vindo ao Avalia Pro!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0; font-size: 16px;">Sua jornada para mais avaliações começa agora</p>
          </div>
          
          <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
            <p style="color: #374151; margin: 0 0 20px; font-size: 16px;">
              Olá${restaurantName ? `, <strong>${restaurantName}</strong>` : ""}! 👋
            </p>
            
            <p style="color: #6b7280; margin: 0 0 25px; font-size: 15px;">
              Ficamos muito felizes em ter você conosco! O Avalia Pro vai ajudar seu restaurante a conquistar mais avaliações positivas no Google e melhorar sua reputação online.
            </p>

            <div style="background: #f0f9ff; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
              <h3 style="color: #0369a1; margin: 0 0 15px; font-size: 16px;">🚀 Próximos passos:</h3>
              <ol style="color: #374151; margin: 0; padding-left: 20px; font-size: 14px;">
                <li style="margin-bottom: 8px;">Complete seu perfil com as informações do restaurante</li>
                <li style="margin-bottom: 8px;">Baixe e imprima seu QR Code personalizado</li>
                <li style="margin-bottom: 8px;">Coloque o QR Code nas mesas para seus clientes avaliarem</li>
                <li style="margin-bottom: 0;">Acompanhe os feedbacks no painel de controle</li>
              </ol>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://avalia-pro.lovable.app/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
                Acessar meu Painel
              </a>
            </div>

            <div style="background: #fef3c7; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>💡 Dica:</strong> Você tem 14 dias de teste grátis! Aproveite para explorar todas as funcionalidades.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 25px 20px; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0 0 10px;">Precisa de ajuda? Acesse nosso suporte no painel.</p>
            <p style="margin: 0;">© 2024 Avalia Pro. Todos os direitos reservados.</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("✅ Email de boas-vindas enviado com sucesso:", JSON.stringify(emailResponse));
    console.log("🏁 Edge Function finalizada com sucesso");

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("❌ Erro na função send-welcome-email:", error);
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