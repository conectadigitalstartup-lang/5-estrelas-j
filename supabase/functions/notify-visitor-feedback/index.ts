import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Admin email to receive notifications
const ADMIN_EMAIL = "alexandrehugolb@gmail.com";

interface FeedbackNotification {
  name: string | null;
  email: string | null;
  feedback_type: string;
  message: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, feedback_type, message }: FeedbackNotification = await req.json();

    console.log("Sending notification for new visitor feedback:", { feedback_type, name, email });

    const typeLabel = feedback_type === "feedback" ? "Feedback" : "Sugestão";
    const typeEmoji = feedback_type === "feedback" ? "💬" : "💡";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #f59e0b, #d97706); padding: 24px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { padding: 32px; }
          .badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-bottom: 20px; }
          .badge-feedback { background: #dbeafe; color: #1d4ed8; }
          .badge-suggestion { background: #fef3c7; color: #d97706; }
          .info-row { margin-bottom: 16px; }
          .info-label { color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
          .info-value { color: #111827; font-size: 16px; }
          .message-box { background: #f9fafb; border-left: 4px solid #f59e0b; padding: 16px; margin-top: 24px; border-radius: 0 8px 8px 0; }
          .message-box p { margin: 0; color: #374151; line-height: 1.6; white-space: pre-wrap; }
          .footer { padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; }
          .cta { display: inline-block; margin-top: 24px; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${typeEmoji} Novo ${typeLabel} Recebido</h1>
          </div>
          <div class="content">
            <span class="badge ${feedback_type === 'feedback' ? 'badge-feedback' : 'badge-suggestion'}">
              ${typeLabel}
            </span>
            
            <div class="info-row">
              <div class="info-label">Nome</div>
              <div class="info-value">${name || 'Não informado'}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">E-mail</div>
              <div class="info-value">${email || 'Não informado'}</div>
            </div>
            
            <div class="message-box">
              <div class="info-label" style="margin-bottom: 8px;">Mensagem</div>
              <p>${message}</p>
            </div>

            <a href="https://avalia-pro.lovable.app/admin/visitor-feedback" class="cta">
              Ver no Painel Admin
            </a>
          </div>
          <div class="footer">
            <p>Avalia Pro - Sistema de Gestão de Avaliações</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Avalia Pro <onboarding@resend.dev>",
      to: [ADMIN_EMAIL],
      subject: `${typeEmoji} Novo ${typeLabel} de Visitante - Avalia Pro`,
      html: emailHtml,
    });

    console.log("Email notification sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error sending notification:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
