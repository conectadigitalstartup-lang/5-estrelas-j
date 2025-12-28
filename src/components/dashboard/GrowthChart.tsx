import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PerformanceData {
  date: string;
  average_rating: number;
  trend?: number | null;
}

interface GrowthChartProps {
  data: PerformanceData[];
  title?: string;
}

const GrowthChart = ({ data, title = "Evolução da Nota Média" }: GrowthChartProps) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <p>Sem dados suficientes para exibir o gráfico.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format data for the chart
  const formattedData = data.map((item) => ({
    ...item,
    formattedDate: format(parseISO(item.date), "dd/MM", { locale: ptBR }),
    average_rating: Number(item.average_rating.toFixed(2)),
    trend: item.trend ? Number(item.trend.toFixed(2)) : null,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-muted-foreground">
              {entry.name === "average_rating" ? "Nota média" : "Tendência"}:{" "}
              <span 
                className="font-semibold" 
                style={{ color: entry.color }}
              >
                {entry.value}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Calculate if trend is positive or negative
  const hasTrend = formattedData.some(d => d.trend !== null);
  const trendDirection = hasTrend && formattedData.length >= 2
    ? (formattedData[formattedData.length - 1].trend || 0) - (formattedData[0].trend || 0)
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-primary" />
            {title}
          </CardTitle>
          {hasTrend && (
            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
              trendDirection > 0 
                ? "bg-success/10 text-success" 
                : trendDirection < 0 
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted text-muted-foreground"
            }`}>
              {trendDirection > 0 ? "↑ Tendência positiva" : trendDirection < 0 ? "↓ Tendência negativa" : "→ Estável"}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="formattedDate"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                formatter={(value) => value === "average_rating" ? "Nota Média" : "Linha de Tendência"}
              />
              <Line
                type="monotone"
                dataKey="average_rating"
                name="average_rating"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
              />
              {hasTrend && (
                <Line
                  type="monotone"
                  dataKey="trend"
                  name="trend"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default GrowthChart;
