import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, ResponsiveContainer, Cell } from "recharts";
import { ChartExportMenu } from "@/components/ui/chart-export-menu";

interface DonutChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  colors?: string[];
}

export function DonutChart({ data, colors = ["#3b82f6", "#22c55e", "#eab308", "#ef4444"] }: DonutChartProps) {
  return (
    <ChartContainer config={{}}>
      <div className="relative">
        <div className="absolute right-0 top-0 z-10">
          <ChartExportMenu data={data} filename="donut-chart" />
        </div>
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
                return <ChartTooltipContent active={active} payload={payload} />;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}
