import { useEffect, useRef } from "react";
import { CheckCircle } from "lucide-react";
import confetti from "canvas-confetti";

interface SuccessScreenProps {
  onComplete: () => void;
}

const SuccessScreen = ({ onComplete }: SuccessScreenProps) => {
  const onCompleteRef = useRef(onComplete);
  
  // Keep ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#E94560", "#1A1A2E", "#10B981"],
    });

    // Redirect after 2 seconds
    const timer = setTimeout(() => {
      onCompleteRef.current();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
        <CheckCircle className="w-12 h-12 text-green-500" />
      </div>
      <h2 className="text-2xl font-semibold text-foreground text-center">
        Tudo pronto! 🎉
      </h2>
      <p className="text-muted-foreground mt-2 text-center">
        Seu restaurante foi configurado com sucesso
      </p>
      <p className="text-sm text-muted-foreground mt-4">
        Redirecionando para o dashboard...
      </p>
    </div>
  );
};

export default SuccessScreen;
