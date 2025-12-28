import { ReactNode, useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Lock, Loader2 } from "lucide-react";
import { usePaywall } from "@/hooks/usePaywall";
import { cn } from "@/lib/utils";
import PaywallModal from "./PaywallModal";

interface PaywallButtonProps extends Omit<ButtonProps, "onClick"> {
  children: ReactNode;
  featureName?: string;
  onClick?: () => void | Promise<void>;
  showLockIcon?: boolean;
}

export const PaywallButton = ({
  children,
  featureName,
  onClick,
  showLockIcon = true,
  className,
  disabled,
  ...props
}: PaywallButtonProps) => {
  const { hasAccess, isInTrial, isLoading: paywallLoading } = usePaywall();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);

  const handleClick = async () => {
    if (paywallLoading) return;

    // If user doesn't have access, show the paywall modal
    if (!hasAccess) {
      setShowPaywallModal(true);
      return;
    }

    // User has access, execute the original action
    setIsProcessing(true);
    if (onClick) {
      await onClick();
    }
    setIsProcessing(false);
  };

  const showLock = !hasAccess && showLockIcon;

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={disabled || isProcessing || paywallLoading}
        className={cn(className)}
        {...props}
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : showLock ? (
          <Lock className="w-4 h-4 mr-2" />
        ) : null}
        {children}
      </Button>

      <PaywallModal
        open={showPaywallModal}
        onOpenChange={setShowPaywallModal}
        featureName={featureName}
      />
    </>
  );
};

export default PaywallButton;