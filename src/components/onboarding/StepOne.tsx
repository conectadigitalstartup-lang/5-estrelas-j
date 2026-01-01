import { Store, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const restaurantTypes = [
  { value: "pizzaria", label: "🍕 Pizzaria" },
  { value: "hamburgueria", label: "🍔 Hamburgueria" },
  { value: "restaurante", label: "🍽️ Restaurante" },
  { value: "bar", label: "🍺 Bar" },
  { value: "cafeteria", label: "☕ Cafeteria" },
  { value: "padaria", label: "🥐 Padaria" },
  { value: "japones", label: "🍣 Japonês" },
  { value: "mexicano", label: "🌮 Mexicano" },
  { value: "italiano", label: "🍝 Italiano" },
  { value: "churrascaria", label: "🍖 Churrascaria" },
  { value: "delivery", label: "📦 Delivery" },
  { value: "outro", label: "🏪 Outro" },
];

interface StepOneData {
  name: string;
  type: string;
  description: string;
  whatsapp: string;
}

interface StepOneProps {
  data: StepOneData;
  onChange: (data: Partial<StepOneData>) => void;
  onNext: () => void;
}

// Formatar número de WhatsApp
const formatWhatsApp = (value: string): string => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, "");
  
  // Limita a 11 dígitos (DDD + 9 dígitos)
  const limited = numbers.slice(0, 11);
  
  // Formata: (XX) XXXXX-XXXX
  if (limited.length <= 2) {
    return limited;
  } else if (limited.length <= 7) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
  } else {
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
  }
};

const StepOne = ({ data, onChange, onNext }: StepOneProps) => {
  // Valida: nome mínimo 3 chars, tipo selecionado, WhatsApp com 11 dígitos
  const whatsappNumbers = (data.whatsapp || "").replace(/\D/g, "");
  const isValid = data.name.trim().length >= 3 && data.type && whatsappNumbers.length === 11;

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value);
    onChange({ whatsapp: formatted });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-foreground">
          Vamos começar! 🚀
        </h2>
        <p className="text-muted-foreground mt-1">
          Conte-nos sobre o seu estabelecimento
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do seu restaurante *</Label>
          <div className="relative">
            <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              placeholder="Ex: Pizzaria do João"
              value={data.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className="pl-10"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Este nome aparecerá na página de avaliação
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo de estabelecimento *</Label>
          <Select
            value={data.type}
            onValueChange={(value) => onChange({ type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {restaurantTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp do Restaurante *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="whatsapp"
              placeholder="(11) 99999-9999"
              value={data.whatsapp || ""}
              onChange={handleWhatsAppChange}
              className="pl-10"
              type="tel"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Usaremos para enviar notificações importantes
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição curta (opcional)</Label>
          <Textarea
            id="description"
            placeholder="A melhor pizza artesanal da cidade!"
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value.slice(0, 150) })}
            rows={2}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground text-right">
            {data.description.length}/150
          </p>
        </div>
      </div>

      <Button
        onClick={onNext}
        disabled={!isValid}
        className="w-full bg-coral hover:bg-coral/90"
        size="lg"
      >
        Próximo
      </Button>
    </div>
  );
};

export default StepOne;
