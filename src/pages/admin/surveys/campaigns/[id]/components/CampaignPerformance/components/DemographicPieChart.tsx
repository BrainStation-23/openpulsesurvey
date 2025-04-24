
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { DemographicBreakdownItem } from "../types";

interface DemographicPieChartProps {
  data: DemographicBreakdownItem[];
  title: string;
}

export function DemographicPieChart({ data, title }: DemographicPieChartProps) {
  // Use a consistent set of colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];
  
  // Limit to top categories and group others for cleaner visualization
  const MAX_SLICES = 5;
  const chartData = [...data];
  
  if (chartData.length > MAX_SLICES) {
    const topItems = chartData.slice(0, MAX_SLICES - 1);
    const otherItems = chartData.slice(MAX_SLICES - 1);
    
    const othersCount = otherItems.reduce((sum, item) => sum + item.count, 0);
    const othersPercentage = otherItems.reduce((sum, item) => sum + item.percentage, 0);
    
    topItems.push({
      name: 'Others',
      count: othersCount,
      percentage: othersPercentage
    });
    
    chartData.length = 0;
    chartData.push(...topItems);
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="aspect-square w-full h-[300px]">
        <ChartContainer config={{}}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={70}
                fill="#8884d8"
                dataKey="count"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload as DemographicBreakdownItem;
                  
                  return (
                    <ChartTooltipContent>
                      <div className="space-y-1">
                        <p className="font-medium">{data.name}</p>
                        <p>Count: {data.count}</p>
                        <p>Percentage: {data.percentage.toFixed(1)}%</p>
                      </div>
                    </ChartTooltipContent>
                  );
                }}
              />
              <Legend 
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ 
                  fontSize: "10px",
                  paddingTop: "10px",
                  maxWidth: "100%"
                }}
                content={renderCustomizedLegend}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}

// Custom legend that wraps and prevents overflow
const renderCustomizedLegend = (props: any) => {
  const { payload } = props;

  if (!payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap justify-center gap-2 mt-2 px-2 text-xs">
      {payload.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center">
          <div
            className="w-3 h-3 mr-1 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="truncate max-w-[80px]" title={entry.value}>
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};
