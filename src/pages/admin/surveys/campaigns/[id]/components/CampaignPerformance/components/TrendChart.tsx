
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { TrendDataPoint } from "../types";

interface TrendChartProps {
  data: TrendDataPoint[];
  title?: string;
}

export function TrendChart({ data, title }: TrendChartProps) {
  return (
    <div className="space-y-2">
      {title && <h3 className="text-sm font-medium">{title}</h3>}
      <div className="aspect-[2/1] w-full">
        <ChartContainer config={{
          responses: { color: "#8884d8" },
          respondents: { color: "#82ca9d" }
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
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
                type="monotone" 
                dataKey="responseCount" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Total Responses"
              />
              <Line 
                type="monotone" 
                dataKey="uniqueRespondents" 
                stroke="#82ca9d" 
                strokeWidth={2}
                name="Unique Respondents"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
