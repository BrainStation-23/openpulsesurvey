
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { PeriodAnalysisDataPoint } from "../types";

interface PeriodComparisonChartProps {
  data: PeriodAnalysisDataPoint[];
  title?: string;
}

export function PeriodComparisonChart({ data, title }: PeriodComparisonChartProps) {
  // Format the data for the chart
  const chartData = data.map(item => ({
    name: `Period ${item.periodNumber}`,
    avgRating: item.avgRating,
    completionRate: item.completionRate,
    responseCount: item.responseCount
  }));

  return (
    <div className="space-y-2">
      {title && <h3 className="text-sm font-medium">{title}</h3>}
      <div className="aspect-[2/1] w-full">
        <ChartContainer config={{
          avgRating: { color: "#8884d8" },
          completionRate: { color: "#82ca9d" },
          responseCount: { color: "#ffc658" }
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
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
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="avgRating" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Avg. Rating"
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="completionRate" 
                stroke="#82ca9d" 
                strokeWidth={2}
                name="Completion Rate (%)"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="responseCount" 
                stroke="#ffc658" 
                strokeWidth={2}
                name="Response Count"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
