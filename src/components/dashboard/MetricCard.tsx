import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  sublabel?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconColor?: string;
}

const MetricCard = ({
  icon: Icon,
  value,
  label,
  sublabel,
  trend,
  iconColor = "text-coral",
}: MetricCardProps) => {
  return (
    <Card className="shadow-card hover:shadow-elevated transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <Icon className={cn("w-5 h-5", iconColor)} />
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {sublabel && (
              <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>
            )}
          </div>
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 text-sm font-medium",
                trend.isPositive ? "text-success" : "text-destructive"
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{trend.value}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;