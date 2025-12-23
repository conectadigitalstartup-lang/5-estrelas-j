import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Star, ArrowLeft, Loader2, Mail, Lock, Eye, EyeOff, User, Building2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" })
});

const signUpSchema = z.object({
  restaurantName: z.string().trim().min(2, { message: "Nome do restaurante é obrigatório" }).max(100),
  email: z.string().trim().email({ message: "Email inválido" }).max(255),
  password: z.string().min(8, { message: "Senha deve ter no mínimo 8 caracteres" }).max(72),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"]
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

const Auth = () => {
  const location = useLocation();
  const isSignUpRoute = location.pathname === "/cadastro";
  const [isSignUp, setIsSignUp] = useState(isSignUpRoute);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { restaurantName: "", email: "", password: "", confirmPassword: "" }
  });

  // Não redireciona automaticamente após signup - deixa o handleSignUp controlar
  // Para login, continua redirecionando para dashboard
  useEffect(() => {
    if (!loading && user && !isSignUp) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate, isSignUp]);

  useEffect(() => {
    setIsSignUp(location.pathname === "/cadastro");
  }, [location.pathname]);

  const getPasswordStrength = (password: string) => {
    if (password.length < 8) return { level: 0, text: "", color: "" };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength <= 1) return { level: 1, text: "Fraca", color: "bg-destructive" };
    if (strength <= 2) return { level: 2, text: "Média", color: "bg-amber-500" };
    return { level: 3, text: "Forte", color: "bg-emerald-500" };
  };

  const passwordValue = signUpForm.watch("password");
  const passwordStrength = getPasswordStrength(passwordValue || "");

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    const { error } = await signIn(data.email, data.password);
    setIsLoading(false);

    if (error) {
      let message = "Erro ao fazer login. Tente novamente.";
      if (error.message.includes("Invalid login credentials")) {
        message = "Email ou senha incorretos.";
      }
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: message
      });
    } else {
      toast({
        title: "Bem-vindo de volta!",
        description: "Login realizado com sucesso."
      });
    }
  };

  const handleSignUp = async (data: SignUpFormData) => {
    if (!acceptedTerms) {
      toast({
        variant: "destructive",
        title: "Termos obrigatórios",
        description: "Você precisa aceitar os termos de uso para continuar."
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(data.email, data.password, data.restaurantName);
    setIsLoading(false);

    if (error) {
      let message = "Erro ao criar conta. Tente novamente.";
      if (error.message.includes("User already registered")) {
        message = "Este email já está cadastrado. Tente fazer login.";
      }
      toast({
        variant: "destructive",
        title: "Erro no cadastro",
        description: message
      });
    } else {
      toast({
        title: "Conta criada com sucesso!",
        description: "Complete o cadastro para iniciar seu teste grátis."
      });
      // Redireciona para página de cadastro do cartão
      navigate("/complete-registration");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-coral" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isSignUp ? "Criar Conta" : "Entrar"} - Máquina de Reviews</title>
        <meta name="description" content="Acesse sua conta da Máquina de Reviews e gerencie a reputação do seu restaurante." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/50 flex flex-col">
        {/* Header */}
        <header className="p-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao início
          </Link>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-[420px]">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-xl bg-coral flex items-center justify-center mb-4 shadow-lg">
                <Star className="w-10 h-10 text-white" fill="currentColor" />
              </div>
              <h1 className="font-display text-2xl font-bold text-navy-dark">
                Avalia Aí
              </h1>
            </div>

            <Card className="border-border/50 shadow-xl rounded-2xl">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-semibold text-foreground">
                  {isSignUp ? "Crie sua conta grátis" : "Bem-vindo de volta!"}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {isSignUp
                    ? "Comece seu teste de 14 dias agora"
                    : "Entre na sua conta para continuar"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {!isSignUp ? (
                  /* Login Form */
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="seu@email.com"
                          className="pl-10 h-11"
                          {...loginForm.register("email")}
                        />
                      </div>
                      {loginForm.formState.errors.email && (
                        <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password">Senha</Label>
                        <button type="button" className="text-xs text-coral hover:underline">
                          Esqueci minha senha
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10 h-11"
                          {...loginForm.register("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full h-12 bg-coral hover:bg-coral/90 text-white font-semibold" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        "Entrar"
                      )}
                    </Button>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">ou</span>
                      </div>
                    </div>

                    <p className="text-center text-sm text-muted-foreground">
                      Não tem uma conta?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUp(true);
                          navigate("/cadastro");
                        }}
                        className="text-coral font-medium hover:underline"
                      >
                        Criar conta grátis
                      </button>
                    </p>
                  </form>
                ) : (
                  /* Sign Up Form */
                  <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-restaurant">Nome do Restaurante</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-restaurant"
                          type="text"
                          placeholder="Ex: Pizzaria do João"
                          className="pl-10 h-11"
                          {...signUpForm.register("restaurantName")}
                        />
                      </div>
                      {signUpForm.formState.errors.restaurantName && (
                        <p className="text-sm text-destructive">{signUpForm.formState.errors.restaurantName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="seu@email.com"
                          className="pl-10 h-11"
                          {...signUpForm.register("email")}
                        />
                      </div>
                      {signUpForm.formState.errors.email && (
                        <p className="text-sm text-destructive">{signUpForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Mínimo 8 caracteres"
                          className="pl-10 pr-10 h-11"
                          {...signUpForm.register("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {passwordValue && passwordValue.length >= 8 && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all ${passwordStrength.color}`}
                              style={{ width: `${(passwordStrength.level / 3) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{passwordStrength.text}</span>
                        </div>
                      )}
                      {signUpForm.formState.errors.password && (
                        <p className="text-sm text-destructive">{signUpForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Confirmar Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-confirm"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Repita a senha"
                          className="pl-10 pr-10 h-11"
                          {...signUpForm.register("confirmPassword")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {signUpForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-destructive">{signUpForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>

                    <div className="flex items-start space-x-2 pt-2">
                      <Checkbox
                        id="terms"
                        checked={acceptedTerms}
                        onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                      />
                      <label
                        htmlFor="terms"
                        className="text-sm text-muted-foreground leading-tight cursor-pointer"
                      >
                        Concordo com os{" "}
                        <a href="#" className="text-coral hover:underline">Termos de Serviço</a>
                        {" "}e{" "}
                        <a href="#" className="text-coral hover:underline">Política de Privacidade</a>
                      </label>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-coral hover:bg-coral/90 text-white font-semibold" 
                      disabled={isLoading || !acceptedTerms}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Criando conta...
                        </>
                      ) : (
                        "Criar conta grátis"
                      )}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground pt-2">
                      Já tem uma conta?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUp(false);
                          navigate("/login");
                        }}
                        className="text-coral font-medium hover:underline"
                      >
                        Fazer login
                      </button>
                    </p>
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

export default Auth;
