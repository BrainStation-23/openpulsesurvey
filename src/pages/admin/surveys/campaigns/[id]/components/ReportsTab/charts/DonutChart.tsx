
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, ResponsiveContainer, Cell } from "recharts";
import { ChartExportMenu } from "@/components/ui/chart-export-menu";

interface DonutChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  colors?: string[];
  filename?: string;
}

export function DonutChart({ 
  data, 
  colors = ["#3b82f6", "#22c55e", "#eab308", "#ef4444"],
  filename = "donut_chart"
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <ChartExportMenu data={data} chartType="donut" filename={filename}>
      <ChartContainer config={{}}>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const entry = payload[0].payload;
                const percentage = ((entry.value / total) * 100).toFixed(1);
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-md">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-muted-foreground">Name:</div>
                      <div>{entry.name}</div>
                      <div className="text-muted-foreground">Value:</div>
                      <div>{entry.value}</div>
                      <div className="text-muted-foreground">Percentage:</div>
                      <div>{percentage}%</div>
                    </div>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </ChartExportMenu>
  );
}
