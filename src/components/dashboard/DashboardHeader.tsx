import { Bell, HelpCircle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  companyName?: string;
  trialDaysLeft?: number;
  unreadCount?: number;
  onMenuClick: () => void;
  isMobile?: boolean;
}

const DashboardHeader = ({
  companyName = "Meu Restaurante",
  trialDaysLeft,
  unreadCount = 0,
  onMenuClick,
  isMobile = false,
}: DashboardHeaderProps) => {
  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onMenuClick}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-lg font-semibold text-foreground">{companyName}</h1>
            {trialDaysLeft !== undefined && trialDaysLeft > 0 && (
              <p className="text-xs text-muted-foreground">
                Trial termina em <span className="text-coral font-medium">{trialDaysLeft} dias</span>
              </p>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>
          <Button variant="ghost" size="icon">
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;