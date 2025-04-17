
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts";

interface BooleanComparisonChartProps {
  baseInstanceData: {
    yes_percentage: number;
    response_count: number;
  };
  comparisonInstanceData: {
    yes_percentage: number;
    response_count: number;
  };
  questionKey: string;
  basePeriodNumber?: number;
  comparisonPeriodNumber?: number;
  className?: string;
}

export function BooleanComparisonChart({
  baseInstanceData,
  comparisonInstanceData,
  questionKey,
  basePeriodNumber,
  comparisonPeriodNumber,
  className,
}: BooleanComparisonChartProps) {
  const data = [
    {
      name: questionKey,
      "Base Yes": baseInstanceData.yes_percentage,
      "Base No": 100 - baseInstanceData.yes_percentage,
      "Base Count": baseInstanceData.response_count,
      "Comparison Yes": comparisonInstanceData.yes_percentage,
      "Comparison No": 100 - comparisonInstanceData.yes_percentage,
      "Comparison Count": comparisonInstanceData.response_count,
    },
  ];

  // Set chart configuration with colors
  const chartConfig = {
    "Base Yes": { color: "#3b82f6" }, // blue
    "Base No": { color: "#93c5fd" }, // light blue
    "Comparison Yes": { color: "#ef4444" }, // red
    "Comparison No": { color: "#fca5a5" }, // light red
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
            <XAxis type="number" domain={[0, 100]} />
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
                      if (typeof value === 'number') {
                        return [`${value.toFixed(1)}%`, name];
                      }
                      return [`${value}%`, name];
                    }}
                  />
                );
              }}
            />
            <Legend formatter={(value) => {
              if (value === "Base Yes") return `${baseLabel} (Yes)`;
              if (value === "Base No") return `${baseLabel} (No)`;
              if (value === "Comparison Yes") return `${comparisonLabel} (Yes)`;
              if (value === "Comparison No") return `${comparisonLabel} (No)`;
              return value;
            }} />
            <Bar 
              dataKey="Base Yes" 
              stackId="base"
              fill="#3b82f6" 
              name="Base Yes"
            />
            <Bar 
              dataKey="Base No" 
              stackId="base"
              fill="#93c5fd" 
              name="Base No"
            />
            <Bar 
              dataKey="Comparison Yes" 
              stackId="comparison"
              fill="#ef4444" 
              name="Comparison Yes"
            />
            <Bar 
              dataKey="Comparison No" 
              stackId="comparison"
              fill="#fca5a5" 
              name="Comparison No"
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
