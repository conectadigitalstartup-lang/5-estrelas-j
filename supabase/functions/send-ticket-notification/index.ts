import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resendApiKey = Deno.env.get("RESEND_API_KEY");
console.log("🚀 Edge Function send-ticket-notification iniciada");
console.log("📧 RESEND_API_KEY configurada:", resendApiKey ? "SIM" : "NÃO");

const resend = new Resend(resendApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  ticketId: string;
  ticketSubject: string;
  adminMessage: string;
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("📨 Requisição recebida:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticketId, ticketSubject, adminMessage, userId }: NotificationRequest = await req.json();
    console.log("📋 Dados recebidos - ticketId:", ticketId, "userId:", userId);

    console.log("Sending notification for ticket:", ticketId, "to user:", userId);

    // Create Supabase client with service role to access user data
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user email from auth.users
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

    if (userError || !userData?.user?.email) {
      console.error("Error fetching user email:", userError);
      return new Response(
        JSON.stringify({ error: "Could not find user email" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const userEmail = userData.user.email;
    console.log("Sending email to:", userEmail);

    const emailResponse = await resend.emails.send({
      from: "Avalia Pro <onboarding@resend.dev>",
      to: [userEmail],
      subject: `Resposta ao seu ticket: ${ticketSubject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Avalia Pro</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Central de Suporte</p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #374151; margin: 0 0 20px;">Você recebeu uma resposta!</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
              <p style="color: #6b7280; margin: 0 0 5px; font-size: 14px;">Assunto do ticket:</p>
              <p style="color: #111827; margin: 0; font-weight: 600;">${ticketSubject}</p>
            </div>
            
            <div style="background: #eef2ff; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
              <p style="color: #6b7280; margin: 0 0 10px; font-size: 14px;">Resposta do suporte:</p>
              <p style="color: #374151; margin: 0; white-space: pre-wrap;">${adminMessage}</p>
            </div>
            
            <p style="color: #6b7280; margin: 30px 0 0; font-size: 14px;">
              Para responder ou ver o histórico completo, acesse seu painel:
            </p>
            
            <a href="https://avalia-pro.lovable.app/dashboard/suporte" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 15px;">
              Ver Ticket
            </a>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0;">© 2024 Avalia Pro. Todos os direitos reservados.</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("✅ Email enviado com sucesso:", JSON.stringify(emailResponse));
    console.log("🏁 Edge Function finalizada com sucesso");

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-ticket-notification function:", error);
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
