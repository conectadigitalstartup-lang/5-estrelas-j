import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, Check, X, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "use-debounce";

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  google_maps_url: string;
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
  };

  const handleClear = () => {
    onSelect(null);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    if (results.length > 0 && !selectedPlace) {
      setIsOpen(true);
    }
  };

  if (selectedPlace) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          Restaurante Selecionado
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
          Este é o restaurante correto? Clique no X para buscar outro.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative space-y-2">
      <label className="block text-sm font-medium text-foreground">
        Buscar seu Restaurante no Google
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleInputFocus}
          placeholder="Digite o nome do seu restaurante..."
          className="pl-10 pr-10"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Dropdown de resultados */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
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
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">Nenhum restaurante encontrado.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Tente um nome diferente ou mais específico.
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Digite pelo menos 3 caracteres para buscar. Selecione seu restaurante na lista.
      </p>
    </div>
  );
};

export default PlaceSearch;