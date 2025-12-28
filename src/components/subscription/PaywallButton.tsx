import { ReactNode, useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Lock, Loader2 } from "lucide-react";
import { usePaywall } from "@/hooks/usePaywall";
import { cn } from "@/lib/utils";

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
  const { hasAccess, isInTrial, requireSubscription, isLoading: paywallLoading } = usePaywall();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = async () => {
    if (paywallLoading) return;

    setIsProcessing(true);

    // If user doesn't have access, redirect to checkout
    if (!hasAccess) {
      await requireSubscription(featureName);
      setIsProcessing(false);
      return;
    }

    // User has access, execute the original action
    if (onClick) {
      await onClick();
    }

    setIsProcessing(false);
  };

  const showLock = !hasAccess && isInTrial && showLockIcon;

  return (
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
  );
};

export default PaywallButton;