import { useState } from "react";
import { MessageSquare, Lightbulb, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const FeedbackSection = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<"feedback" | "suggestion">("feedback");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error("Por favor, escreva sua mensagem");
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackData = {
        name: name.trim() || null,
        email: email.trim() || null,
        feedback_type: activeTab === "suggestion" ? "sugestao" : "feedback",
        message: message.trim(),
      };

      const { error } = await supabase.from("visitor_feedback").insert(feedbackData);

      if (error) throw error;

      // Send email notification (fire and forget - don't block on this)
      supabase.functions.invoke("notify-visitor-feedback", {
        body: feedbackData,
      }).catch((err) => console.error("Error sending notification:", err));

      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
      toast.success(
        activeTab === "feedback" 
          ? "Obrigado pelo seu feedback!" 
          : "Obrigado pela sua sugestão!"
      );

      // Reset after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Erro ao enviar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="feedback" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Sua Opinião
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Queremos Ouvir Você!
          </h2>
          <p className="text-muted-foreground text-lg">
            Seu feedback nos ajuda a melhorar constantemente. Compartilhe sua experiência ou sugira melhorias.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-elevated">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-success" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">
                  Mensagem Enviada!
                </h3>
                <p className="text-muted-foreground">
                  Agradecemos por compartilhar sua opinião conosco.
                </p>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "feedback" | "suggestion")}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="feedback" className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Feedback
                  </TabsTrigger>
                  <TabsTrigger value="suggestion" className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Sugestão
                  </TabsTrigger>
                </TabsList>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <TabsContent value="feedback" className="mt-0">
                    <p className="text-sm text-muted-foreground mb-4">
                      Conte-nos sobre sua experiência com o Avalia Pro ou o que achou do nosso site.
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="suggestion" className="mt-0">
                    <p className="text-sm text-muted-foreground mb-4">
                      Tem uma ideia para melhorar nosso produto? Adoraríamos ouvir!
                    </p>
                  </TabsContent>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Seu nome (opcional)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-background"
                    />
                    <Input
                      type="email"
                      placeholder="Seu e-mail (opcional)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-background"
                    />
                  </div>

                  <Textarea
                    placeholder={
                      activeTab === "feedback"
                        ? "Escreva seu feedback aqui..."
                        : "Descreva sua sugestão de melhoria..."
                    }
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[120px] bg-background"
                    required
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || !message.trim()}
                  >
                    {isSubmitting ? (
                      "Enviando..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar {activeTab === "feedback" ? "Feedback" : "Sugestão"}
                      </>
                    )}
                  </Button>
                </form>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeedbackSection;
