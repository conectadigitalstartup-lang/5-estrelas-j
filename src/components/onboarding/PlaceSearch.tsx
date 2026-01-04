import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, Check, X, Building2, Link2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "use-debounce";

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  google_maps_url: string;
  rating?: number | null;
  user_ratings_total?: number | null;
}

interface PlaceSearchProps {
  onSelect: (place: PlaceResult | null) => void;
  selectedPlace: PlaceResult | null;
  restaurantName?: string;
}

const PlaceSearch = ({ onSelect, selectedPlace, restaurantName }: PlaceSearchProps) => {
  const [query, setQuery] = useState(restaurantName || "");
  const [debouncedQuery] = useDebounce(query, 500);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const [isLoadingManual, setIsLoadingManual] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update query when restaurantName changes
  useEffect(() => {
    if (restaurantName && !selectedPlace) {
      setQuery(restaurantName);
    }
  }, [restaurantName, selectedPlace]);

  // Search when debounced query changes
  useEffect(() => {
    const searchPlaces = async () => {
      if (debouncedQuery.length < 3) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data, error: fnError } = await supabase.functions.invoke("search-places", {
          body: { query: debouncedQuery },
        });

        if (fnError) throw fnError;

        if (data.error) {
          setError(data.error);
          setResults([]);
        } else {
          setResults(data.results || []);
          setIsOpen(data.results?.length > 0);
        }
      } catch (err: any) {
        console.error("Erro ao buscar lugares:", err);
        setError("Erro ao buscar. Tente novamente.");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (!selectedPlace) {
      searchPlaces();
    }
  }, [debouncedQuery, selectedPlace]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (place: PlaceResult) => {
    onSelect(place);
    setQuery(place.name);
    setIsOpen(false);
    setResults([]);
    setShowManualInput(false);
  };

  const handleClear = () => {
    onSelect(null);
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setShowManualInput(false);
    setManualUrl("");
  };

  const handleInputFocus = () => {
    if (results.length > 0 && !selectedPlace) {
      setIsOpen(true);
    }
  };

  const handleManualUrlSubmit = async () => {
    if (!manualUrl.trim()) return;

    // Validate it's a Google Maps URL
    if (!manualUrl.includes("google.com/maps") && !manualUrl.includes("maps.google") && !manualUrl.includes("goo.gl")) {
      setError("Por favor, cole um link válido do Google Maps.");
      return;
    }

    setIsLoadingManual(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("search-places", {
        body: { google_maps_url: manualUrl },
      });

      if (fnError) throw fnError;

      if (data.error) {
        setError(data.error);
      } else if (data.result) {
        handleSelect(data.result);
      } else {
        setError("Não foi possível encontrar o estabelecimento. Verifique o link e tente novamente.");
      }
    } catch (err: any) {
      console.error("Erro ao processar URL:", err);
      setError("Erro ao processar o link. Tente novamente.");
    } finally {
      setIsLoadingManual(false);
    }
  };

  if (selectedPlace) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          Estabelecimento Selecionado
        </label>
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-lg">{selectedPlace.name}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="flex-shrink-0 text-muted-foreground hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="mt-3 pl-13 flex items-start gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">{selectedPlace.formatted_address}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Este é o estabelecimento correto? Clique no X para buscar outro.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Busca por nome */}
      <div className="space-y-2 relative">
        <label className="block text-sm font-medium text-foreground">
          Buscar seu Estabelecimento no Google
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleInputFocus}
            placeholder="Digite o nome do seu estabelecimento..."
            className="pl-10 pr-10"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Dropdown de resultados */}
        {isOpen && results.length > 0 && (
          <div className="z-50 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden">
            <ul className="max-h-80 overflow-y-auto divide-y divide-border">
              {results.map((place) => (
                <li key={place.place_id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(place)}
                    className="w-full p-4 text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground">{place.name}</p>
                        <div className="mt-1 flex items-start gap-1.5 text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                          <p className="text-sm leading-relaxed">{place.formatted_address}</p>
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {isOpen && results.length === 0 && !isLoading && query.length >= 3 && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Nenhum resultado encontrado</p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Tente um nome diferente ou use a opção de colar o link do Google Maps abaixo.
                </p>
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Digite pelo menos 3 caracteres. Funciona para restaurantes, bares, cafés, lojas e qualquer estabelecimento.
        </p>
      </div>

      {/* Separador */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">ou</span>
        </div>
      </div>

      {/* Input manual de URL */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setShowManualInput(!showManualInput)}
          className="flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <Link2 className="w-4 h-4" />
          {showManualInput ? "Ocultar opção de link" : "Não encontrou? Cole o link do Google Maps"}
        </button>

        {showManualInput && (
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border">
            <div className="space-y-1">
              <p className="text-sm font-medium">Como obter o link:</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Abra o <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Maps</a></li>
                <li>Busque seu estabelecimento</li>
                <li>Clique em "Compartilhar" e copie o link</li>
                <li>Cole aqui abaixo</li>
              </ol>
            </div>
            
            <div className="flex gap-2">
              <Input
                type="url"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="Cole o link do Google Maps aqui..."
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleManualUrlSubmit}
                disabled={isLoadingManual || !manualUrl.trim()}
                size="sm"
              >
                {isLoadingManual ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Buscar"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

export default PlaceSearch;
