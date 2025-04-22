import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { ChartExportMenu } from "@/components/ui/chart-export-menu";

interface GroupedBarChartProps {
  data: Array<{
    name: string;
    [key: string]: string | number;
  }>;
  keys: string[];
  colors?: string[];
  height?: number;
}

export function GroupedBarChart({ 
  data, 
  keys, 
  colors = ["#3b82f6", "#22c55e", "#eab308"], 
  height = 200 
}: GroupedBarChartProps) {
  return (
    <ChartContainer config={{}}>
      <div className="relative">
        <div className="absolute right-0 top-0 z-10">
          <ChartExportMenu data={data} filename="grouped-bar-chart" />
        </div>
        <ResponsiveContainer width="100%" height="100%">
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
            {keys.map((key, index) => (
              <Bar 
                key={key} 
                dataKey={key} 
                fill={colors[index % colors.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}
