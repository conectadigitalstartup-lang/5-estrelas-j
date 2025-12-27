import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MonthlyKPIsProps {
  positiveCount: number;
  negativeCount: number;
}

const MonthlyKPIs = ({ positiveCount, negativeCount }: MonthlyKPIsProps) => {
  const currentMonth = new Date().toLocaleDateString("pt-BR", { month: "long" });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border-emerald-200 dark:border-emerald-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <ThumbsUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{positiveCount}</p>
              <p className="text-sm text-muted-foreground">
                Feedbacks Positivos
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {currentMonth}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
              <ThumbsDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{negativeCount}</p>
              <p className="text-sm text-muted-foreground">
                Feedbacks Negativos
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {currentMonth}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyKPIs;
