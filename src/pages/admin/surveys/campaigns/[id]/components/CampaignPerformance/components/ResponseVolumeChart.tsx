
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ResponseVolumeDataPoint } from "../types";

interface ResponseVolumeChartProps {
  readonly data: ResponseVolumeDataPoint[];
  readonly title?: string;
}

export function ResponseVolumeChart({ data, title }: ResponseVolumeChartProps) {
  // Format the data for the chart
  const chartData = data.map(item => ({
    name: `Period ${item.periodNumber}`,
    responseCount: item.responseCount
  }));

  return (
    <div className="space-y-2">
      {!!title && <h3 className="text-sm font-medium">{title}</h3>}
      <div className="aspect-[2/1] w-full">
        <ChartContainer config={{}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const dataIndex = chartData.findIndex(item => item.name === label);
                  const originalData = data[dataIndex];
                  
                  return (
                    <ChartTooltipContent>
                      <div className="space-y-1">
                        <p className="font-medium">{label}</p>
                        <p>Total Responses: {payload[0].value}</p>
                        {originalData?.averageTimeToComplete && (
                          <p>Avg. Time to Complete: {originalData.averageTimeToComplete.toFixed(1)} days</p>
                        )}
                      </div>
                    </ChartTooltipContent>
                  );
                }}
              />
              <Bar 
                dataKey="responseCount" 
                fill="#82ca9d" 
                name="Response Count"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
