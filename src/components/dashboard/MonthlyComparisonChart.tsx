import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MonthlyData {
  month: string;
  average_rating: number;
  total_feedbacks: number;
}

interface MonthlyComparisonChartProps {
  data: MonthlyData[];
}

const MonthlyComparisonChart = ({ data }: MonthlyComparisonChartProps) => {
  if (!data || data.length === 0) {
    return null;
  }

  // Format data for the chart
  const formattedData = data.map((item) => ({
    ...item,
    formattedMonth: format(parseISO(`${item.month}-01`), "MMM/yy", { locale: ptBR }),
    average_rating: Number(item.average_rating.toFixed(2)),
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-foreground capitalize">{label}</p>
          <p className="text-sm text-muted-foreground">
            Nota média: <span className="font-semibold text-primary">{data.average_rating}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Total de feedbacks: <span className="font-semibold">{data.total_feedbacks}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Get color based on rating
  const getBarColor = (rating: number) => {
    if (rating >= 4) return "hsl(var(--success))";
    if (rating >= 3) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  // Calculate month-over-month change
  const lastMonth = formattedData[formattedData.length - 1];
  const previousMonth = formattedData[formattedData.length - 2];
  const monthChange = previousMonth 
    ? ((lastMonth.average_rating - previousMonth.average_rating) / previousMonth.average_rating * 100).toFixed(1)
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarDays className="w-5 h-5 text-primary" />
            Comparação Mensal
          </CardTitle>
          {monthChange !== null && (
            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
              Number(monthChange) > 0 
                ? "bg-success/10 text-success" 
                : Number(monthChange) < 0 
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted text-muted-foreground"
            }`}>
              {Number(monthChange) > 0 ? "+" : ""}{monthChange}% vs mês anterior
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="formattedMonth"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                domain={[0, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="average_rating" radius={[4, 4, 0, 0]}>
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.average_rating)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyComparisonChart;
