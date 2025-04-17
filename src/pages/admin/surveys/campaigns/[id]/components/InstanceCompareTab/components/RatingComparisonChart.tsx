
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts";

interface RatingComparisonChartProps {
  baseInstanceData: {
    avg_numeric_value: number;
    response_count: number;
  };
  comparisonInstanceData: {
    avg_numeric_value: number;
    response_count: number;
  };
  questionKey: string;
  basePeriodNumber?: number;
  comparisonPeriodNumber?: number;
  className?: string;
}

export function RatingComparisonChart({
  baseInstanceData,
  comparisonInstanceData,
  questionKey,
  basePeriodNumber,
  comparisonPeriodNumber,
  className,
}: RatingComparisonChartProps) {
  const data = [
    {
      name: questionKey,
      "Base Instance": baseInstanceData.avg_numeric_value,
      "Base Count": baseInstanceData.response_count,
      "Comparison Instance": comparisonInstanceData.avg_numeric_value,
      "Comparison Count": comparisonInstanceData.response_count,
    },
  ];

  // Set chart configuration with colors
  const chartConfig = {
    "Base Instance": { color: "#3b82f6" }, // blue
    "Comparison Instance": { color: "#ef4444" }, // red
  };

  const baseLabel = basePeriodNumber ? `Period ${basePeriodNumber}` : "Base";
  const comparisonLabel = comparisonPeriodNumber ? `Period ${comparisonPeriodNumber}` : "Comparison";

  return (
    <div className={`w-full ${className}`}>
      <ChartContainer config={chartConfig} className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 5]} />
            <YAxis dataKey="name" type="category" />
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                return (
                  <ChartTooltipContent 
                    active={active} 
                    payload={payload}
                    formatter={(value, name) => {
                      if (name === "Base Count" || name === "Comparison Count") {
                        return [`${value} responses`, name.replace("Count", "Responses")];
                      }
                      return [`${value.toFixed(2)}`, name];
                    }}
                  />
                );
              }}
            />
            <Legend formatter={(value) => {
              if (value === "Base Instance") return baseLabel;
              if (value === "Comparison Instance") return comparisonLabel;
              return value;
            }} />
            <Bar 
              dataKey="Base Instance" 
              fill="#3b82f6" 
              name="Base Instance"
              radius={[0, 4, 4, 0]} 
            />
            <Bar 
              dataKey="Comparison Instance" 
              fill="#ef4444" 
              name="Comparison Instance"
              radius={[0, 4, 4, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
