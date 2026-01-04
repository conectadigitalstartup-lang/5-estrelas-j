import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

const OnboardingProgress = ({ currentStep, totalSteps }: OnboardingProgressProps) => {
  return (
    <div className="flex flex-col items-center mb-8">
      <div className="flex items-center gap-0">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          const isPending = stepNumber > currentStep;

          return (
            <div key={stepNumber} className="flex items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                  isCompleted && "bg-green-500 text-white",
                  isActive && "bg-gold text-primary",
                  isPending && "bg-transparent border-2 border-border text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  stepNumber
                )}
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={cn(
                    "w-12 h-0.5 transition-all duration-300",
                    stepNumber < currentStep ? "bg-green-500" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground mt-3">
        Etapa {currentStep} de {totalSteps}
      </p>
    </div>
  );
};

export default OnboardingProgress;
