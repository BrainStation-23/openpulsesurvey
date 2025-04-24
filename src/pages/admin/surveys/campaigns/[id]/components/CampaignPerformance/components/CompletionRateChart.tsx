
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { CompletionRateDataPoint } from "../types";

interface CompletionRateChartProps {
  data: CompletionRateDataPoint[];
  title?: string;
}

export function CompletionRateChart({ data, title }: CompletionRateChartProps) {
  // Format the data for the chart
  const chartData = data.map(item => ({
    name: `Period ${item.periodNumber}`,
    completionRate: item.completionRate
  }));

  return (
    <div className="space-y-2">
      {title && <h3 className="text-sm font-medium">{title}</h3>}
      <div className="aspect-[2/1] w-full">
        <ChartContainer config={{}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis unit="%" domain={[0, 100]} />
              <ChartTooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const dataIndex = chartData.findIndex(item => item.name === label);
                  const originalData = data[dataIndex];
                  
                  return (
                    <ChartTooltipContent>
                      <div className="space-y-1">
                        <p className="font-medium">{label}</p>
                        <p>Completion Rate: {payload[0].value}%</p>
                        <p>Total Assignments: {originalData?.totalAssignments}</p>
                        <p>Completed: {originalData?.completedResponses}</p>
                      </div>
                    </ChartTooltipContent>
                  );
                }}
              />
              <Bar 
                dataKey="completionRate" 
                fill="#8884d8" 
                name="Completion Rate"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
