
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Cell } from "recharts";

interface StackedBarChartProps {
  data: Array<{
    name: string;
    [key: string]: string | number;
  }>;
  keys: string[];
  colors?: string[];
  height?: number;
  stacked?: boolean;
}

export function StackedBarChart({ 
  data, 
  keys, 
  colors = ["#3b82f6", "#22c55e", "#eab308", "#ef4444", "#8b5cf6", "#f97316"], 
  height = 300,
  stacked = true
}: StackedBarChartProps) {
  return (
    <ChartContainer config={{}}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart 
          data={data} 
          margin={{ top: 20, right: 30, left: 20, bottom: 75 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-35} 
            textAnchor="end"
            interval={0}
            dy={10}
          />
          <YAxis allowDecimals={false} />
          <ChartTooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <ChartTooltipContent 
                  active={active} 
                  payload={payload} 
                  label={label}
                />
              );
            }}
          />
          <Legend />
          {keys.map((key, index) => (
            <Bar 
              key={key} 
              dataKey={key} 
              stackId={stacked ? "stack" : undefined}
              fill={colors[index % colors.length]}
              radius={stacked ? [0, 0, 0, 0] : [4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
