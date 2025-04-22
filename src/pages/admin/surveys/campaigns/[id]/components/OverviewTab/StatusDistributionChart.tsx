
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ChartExportMenu } from "@/components/ui/chart-export-menu";

const COLORS = {
  'Submitted': '#10B981', // green
  'In_progress': '#3B82F6', // blue
  'Expired': '#EF4444', // red
  'Assigned': '#F59E0B', // amber
};

export type StatusData = {
  name: string;
  value: number;
};

type StatusDistributionChartProps = {
  data: StatusData[] | undefined;
};

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  // If data is undefined or empty, return early with a placeholder
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Distribution</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ChartExportMenu data={data} chartType="pie" filename="status_distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => 
                  `${name} (${((value / total) * 100).toFixed(0)}%)`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry) => (
                  <Cell 
                    key={`cell-${entry.name}`} 
                    fill={COLORS[entry.name as keyof typeof COLORS] || '#CBD5E1'} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [
                  `${value} (${((value / total) * 100).toFixed(1)}%)`,
                  'Count'
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartExportMenu>
      </CardContent>
    </Card>
  );
}
