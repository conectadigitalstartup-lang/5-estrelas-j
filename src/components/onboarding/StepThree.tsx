import { useState } from "react";
import { Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import PlaceSearch from "./PlaceSearch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  google_maps_url: string;
}

interface StepThreeProps {
  googleLink: string;
  onChange: (link: string) => void;
  onComplete: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  selectedPlace?: PlaceResult | null;
  onPlaceSelect?: (place: PlaceResult | null) => void;
  restaurantName?: string;
}

const StepThree = ({ 
  googleLink, 
  onChange, 
  onComplete, 
  onBack, 
  isSubmitting,
  selectedPlace,
  onPlaceSelect,
  restaurantName,
}: StepThreeProps) => {
  const [helpOpen, setHelpOpen] = useState(false);

  const isValid = selectedPlace !== null && selectedPlace !== undefined;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-foreground">
          Último passo! 🎯
        </h2>
        <p className="text-muted-foreground mt-1">
          Encontre seu restaurante no Google para conectar as avaliações
        </p>
      </div>

      <div className="space-y-4">
        <PlaceSearch
          onSelect={(place) => {
            if (onPlaceSelect) {
              onPlaceSelect(place);
            }
            if (place) {
              onChange(place.google_maps_url);
            } else {
              onChange("");
            }
          }}
          selectedPlace={selectedPlace || null}
          restaurantName={restaurantName}
        />

        <Collapsible open={helpOpen} onOpenChange={setHelpOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
            <Info className="w-4 h-4" />
            <span>Não encontrou seu restaurante?</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                helpOpen && "rotate-180"
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-3">
              <p className="font-medium text-foreground">Possíveis motivos:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>O restaurante ainda não está cadastrado no Google Meu Negócio</li>
                <li>O nome está diferente do cadastrado no Google</li>
                <li>Tente buscar com o nome completo ou endereço</li>
              </ul>
              
              <p className="font-medium text-foreground pt-2">Como cadastrar no Google:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Acesse <a href="https://business.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">business.google.com</a></li>
                <li>Clique em "Gerenciar agora"</li>
                <li>Siga as instruções para cadastrar seu estabelecimento</li>
                <li>Após aprovado, volte aqui e busque novamente</li>
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