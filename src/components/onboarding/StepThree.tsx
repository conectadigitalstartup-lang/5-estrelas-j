import { useState } from "react";
import { ExternalLink, Check, X, Loader2, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface StepThreeProps {
  googleLink: string;
  onChange: (link: string) => void;
  onComplete: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const StepThree = ({ googleLink, onChange, onComplete, onBack, isSubmitting }: StepThreeProps) => {
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const isValidGoogleLink = (link: string) => {
    if (!link.trim()) return null;
    const lowercased = link.toLowerCase();
    return (
      lowercased.includes("google") ||
      lowercased.includes("g.page") ||
      lowercased.includes("maps.google") ||
      lowercased.includes("goo.gl")
    );
  };

  const validationState = isValidGoogleLink(googleLink);
  const isValid = validationState === true;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-foreground">
          Último passo! 🎯
        </h2>
        <p className="text-muted-foreground mt-1">
          Conecte seu perfil do Google para receber avaliações
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="googleLink">Link do seu Google Meu Negócio</Label>
          <div className="relative">
            <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="googleLink"
              type="url"
              placeholder="https://g.page/r/seu-restaurante/review"
              value={googleLink}
              onChange={(e) => onChange(e.target.value)}
              className={cn(
                "pl-10 pr-10",
                validationState === true && "border-green-500 focus-visible:ring-green-500",
                validationState === false && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {validationState !== null && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {validationState ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-destructive" />
                )}
              </div>
            )}
          </div>
          {validationState === true && (
            <p className="text-xs text-green-600">Link válido! ✓</p>
          )}
          {validationState === false && (
            <p className="text-xs text-destructive">
              Por favor, insira um link válido do Google
            </p>
          )}
        </div>

        <Collapsible open={tutorialOpen} onOpenChange={setTutorialOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm text-coral hover:text-coral/80 transition-colors">
            <span>📖 Como encontrar meu link do Google?</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                tutorialOpen && "rotate-180"
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-3">
              <p className="font-medium text-foreground">Opção 1: Via Google Meu Negócio</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Acesse google.com/business e faça login</li>
                <li>Selecione seu estabelecimento</li>
                <li>Clique em "Início" no menu lateral</li>
                <li>Procure o card "Receber mais avaliações"</li>
                <li>Clique em "Compartilhar formulário de avaliação"</li>
                <li>Copie o link e cole aqui</li>
              </ol>

              <p className="font-medium text-foreground pt-2">Opção 2: Pesquisa no Google</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Pesquise seu restaurante no Google</li>
                <li>Clique no nome do seu estabelecimento</li>
                <li>Clique em "Escrever uma avaliação"</li>
                <li>Copie a URL da página e cole aqui</li>
              </ol>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1"
          size="lg"
          disabled={isSubmitting}
        >
          Voltar
        </Button>
        <Button
          onClick={onComplete}
          disabled={!isValid || isSubmitting}
          className="flex-1 bg-coral hover:bg-coral/90"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            "Concluir Configuração"
          )}
        </Button>
      </div>
    </div>
  );
};

export default StepThree;
