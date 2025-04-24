import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { DemographicBreakdownItem } from "../types";

interface DemographicPieChartProps {
  data: DemographicBreakdownItem[];
  title: string;
  showLegend?: boolean;
}

export function DemographicPieChart({ data, title, showLegend = true }: DemographicPieChartProps) {
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
    <div className="space-y-2 w-full h-full flex flex-col">
      <div className="flex-1 w-full">
        <ChartContainer config={{}}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="name"
                label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
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
              {showLegend && (
                <Legend 
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  content={renderCustomizedLegend}
                />
              )}
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
    <div className="flex flex-wrap justify-center gap-2 mt-2 px-1 text-[9px] max-w-full overflow-hidden">
      {payload.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center">
          <div
            className="w-2 h-2 mr-1 rounded-sm flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="truncate max-w-[60px]" title={entry.value}>
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};
