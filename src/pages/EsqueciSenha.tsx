import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Mail, CheckCircle } from "lucide-react";
import avaliaProShield from "@/assets/avalia-pro-shield.jpg";

const schema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }),
});

type FormData = z.infer<typeof schema>;

const EsqueciSenha = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true);

    try {
      // First, generate the password reset link via Supabase
      const { data: resetData, error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/atualizar-senha`,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao enviar email",
          description: "Tente novamente mais tarde.",
        });
      } else {
        // Send custom branded email via edge function
        try {
          await supabase.functions.invoke('send-password-reset', {
            body: { 
              email: data.email, 
              resetLink: `${window.location.origin}/atualizar-senha` 
            }
          });
        } catch (emailError) {
          console.log("Custom email failed, Supabase default was sent:", emailError);
        }
        
        setEmailSent(true);
        toast({
          title: "Email enviado!",
          description: "Verifique sua caixa de entrada.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
      });
    }

    setIsLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Esqueci minha senha - Avalia Pro</title>
        <meta name="description" content="Recupere o acesso à sua conta Avalia Pro." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/50 flex flex-col">
        <header className="p-4">
          <Link to="/auth" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao login
          </Link>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-[420px]">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="h-20 w-20 rounded-full overflow-hidden bg-[#0f172a] flex items-center justify-center mb-3">
                <img 
                  src={avaliaProShield} 
                  alt="Avalia Pro" 
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-display font-bold text-foreground text-2xl">Avalia Pro</span>
            </div>

            <Card className="border-border/50 shadow-xl rounded-2xl">
              <CardHeader className="text-center pb-2">
                {emailSent ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-emerald-100 mx-auto flex items-center justify-center mb-4">
                      <CheckCircle className="w-10 h-10 text-emerald-500" />
                    </div>
                    <CardTitle className="text-2xl font-semibold text-foreground">
                      Email enviado!
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
                    </CardDescription>
                  </>
                ) : (
                  <>
                    <CardTitle className="text-2xl font-semibold text-foreground">
                      Recuperar senha
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Digite seu email para receber um link de recuperação
                    </CardDescription>
                  </>
                )}
              </CardHeader>
              <CardContent className="pt-4">
                {emailSent ? (
                  <div className="space-y-4">
                    <p className="text-sm text-center text-muted-foreground">
                      Não recebeu o email? Verifique sua pasta de spam ou tente novamente.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setEmailSent(false)}
                    >
                      Enviar novamente
                    </Button>
                    <div className="text-center">
                      <Link to="/auth" className="text-coral font-medium hover:underline text-sm">
                        Voltar ao login
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          className="pl-10 h-11"
                          {...form.register("email")}
                        />
                      </div>
                      {form.formState.errors.email && (
                        <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-coral hover:bg-coral/90 text-white font-semibold"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        "Enviar link de recuperação"
                      )}
                    </Button>

                    <div className="text-center">
                      <Link to="/auth" className="text-coral font-medium hover:underline text-sm">
                        Voltar ao login
                      </Link>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default EsqueciSenha;