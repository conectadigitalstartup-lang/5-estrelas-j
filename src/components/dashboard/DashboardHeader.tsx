import { Bell, HelpCircle, Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  companyName?: string;
  trialDaysLeft?: number;
  unreadCount?: number;
  onMenuClick: () => void;
  isMobile?: boolean;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/qr-code": "Meu QR Code",
  "/dashboard/feedbacks": "Feedbacks",
  "/dashboard/settings": "Configurações",
  "/dashboard/upgrade": "Upgrade",
};

const DashboardHeader = ({
  companyName = "Meu Restaurante",
  trialDaysLeft,
  unreadCount = 0,
  onMenuClick,
  isMobile = false,
}: DashboardHeaderProps) => {
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || "Dashboard";

  return (
    <header className="sticky top-0 z-30 bg-background border-b border-border shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onMenuClick}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-xl font-semibold text-foreground">{pageTitle}</h1>
            <p className="text-xs text-muted-foreground">{companyName}</p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {trialDaysLeft !== undefined && trialDaysLeft > 0 && (
            <div className="hidden sm:flex items-center px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
              Trial: {trialDaysLeft} dias restantes
            </div>
          )}

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