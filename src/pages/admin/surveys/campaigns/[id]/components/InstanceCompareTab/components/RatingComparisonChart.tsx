
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface ChartData {
  name: string;
  base: number;
  comparison: number;
}

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
}

export function RatingComparisonChart({
  baseInstanceData,
  comparisonInstanceData,
  basePeriodNumber,
  comparisonPeriodNumber,
}: RatingComparisonChartProps) {
  // Format period labels
  const baseLabel = basePeriodNumber ? `Period ${basePeriodNumber}` : "Base";
  const comparisonLabel = comparisonPeriodNumber ? `Period ${comparisonPeriodNumber}` : "Current";

  // Calculate percentage change for display
  const changeValue = comparisonInstanceData.avg_numeric_value - baseInstanceData.avg_numeric_value;
  const changePercent = baseInstanceData.avg_numeric_value !== 0
    ? (changeValue / baseInstanceData.avg_numeric_value) * 100
    : 0;
    
  // Prepare chart data
  const data: ChartData[] = [
    {
      name: "Average Rating",
      base: baseInstanceData.avg_numeric_value,
      comparison: comparisonInstanceData.avg_numeric_value,
    },
  ];

  // Determine colors based on change direction
  const baseColor = "#9b87f5"; // Primary purple
  const comparisonColor = changeValue > 0 ? "#22c55e" : changeValue < 0 ? "#ef4444" : "#8E9196"; // Green, Red, or Gray

  return (
    <div className="w-full">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barGap={30}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 5]} />
            <Tooltip
              formatter={(value: number) => [value.toFixed(2), ""]}
              labelFormatter={() => "Average Rating"}
              contentStyle={{ borderRadius: "8px" }}
            />
            <Legend formatter={(value) => {
              return value === 'base' ? baseLabel : comparisonLabel;
            }} />
            <Bar 
              dataKey="base" 
              name="base" 
              fill={baseColor} 
              radius={[4, 4, 0, 0]} 
              barSize={40} 
            />
            <Bar 
              dataKey="comparison" 
              name="comparison" 
              fill={comparisonColor} 
              radius={[4, 4, 0, 0]} 
              barSize={40} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-2 text-center text-sm text-muted-foreground">
        <span className={`font-medium ${
          changeValue > 0 
            ? 'text-green-500' 
            : changeValue < 0 
            ? 'text-red-500' 
            : ''
        }`}>
          {changeValue > 0 ? "+" : ""}{changeValue.toFixed(2)} 
          {" "}
          ({changeValue > 0 ? "+" : ""}{changePercent.toFixed(1)}%)
        </span>
        {" "}change from {baseLabel} to {comparisonLabel}
      </div>
    </div>
  );
}
