
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
  // Transform data for stacked bar chart
  const data = [
    {
      name: "Base",
      label: basePeriodNumber ? `Period ${basePeriodNumber}` : "Base",
      Yes: baseInstanceData.yes_percentage,
      No: 100 - baseInstanceData.yes_percentage,
      count: baseInstanceData.response_count,
    },
    {
      name: "Comparison",
      label: comparisonPeriodNumber ? `Period ${comparisonPeriodNumber}` : "Comparison",
      Yes: comparisonInstanceData.yes_percentage,
      No: 100 - comparisonInstanceData.yes_percentage,
      count: comparisonInstanceData.response_count,
    },
  ];

  // Set chart configuration with colors
  const chartConfig = {
    "Yes": { color: "#22c55e" }, // green
    "No": { color: "#ef4444" }, // red
  };

  return (
    <div className={`w-full ${className}`}>
      <ChartContainer config={chartConfig} className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            stackOffset="expand"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis tickFormatter={(tick) => `${tick}%`} />
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                
                // Find the data point for this tooltip
                const dataPoint = data.find(d => d.name === payload[0]?.payload.name);
                
                return (
                  <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-sm shadow-xl">
                    <p className="font-medium">{dataPoint?.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Total Responses: {dataPoint?.count}
                    </p>
                    <div className="mt-2 flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          <span>Yes:</span>
                        </div>
                        <span>{dataPoint?.Yes.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-red-500" />
                          <span>No:</span>
                        </div>
                        <span>{dataPoint?.No.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Legend />
            <Bar dataKey="Yes" stackId="a" fill="#22c55e" />
            <Bar dataKey="No" stackId="a" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
