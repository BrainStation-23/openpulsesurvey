
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Tooltip, TooltipProps } from "recharts";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

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
  questionKey,
  basePeriodNumber,
  comparisonPeriodNumber
}: RatingComparisonChartProps) {
  // Get the values
  const baseAvg = baseInstanceData.avg_numeric_value;
  const comparisonAvg = comparisonInstanceData.avg_numeric_value;
  
  // Calculate change metrics
  const change = comparisonAvg - baseAvg;
  const changePercentage = baseAvg !== 0 ? (change / baseAvg) * 100 : 0;
  const isSignificantChange = Math.abs(changePercentage) > 5 || Math.abs(change) > 0.5;

  // Prepare data for the chart
  const data = [
    {
      name: questionKey,
      base: baseAvg,
      comparison: comparisonAvg,
      baseCount: baseInstanceData.response_count,
      comparisonCount: comparisonInstanceData.response_count,
      change: change
    }
  ];

  // Define custom tooltip for better information display
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-medium text-gray-900">Rating Comparison</p>
          <div className="text-sm space-y-1 mt-1">
            <p className="text-gray-600">
              <span className="font-medium">Period {basePeriodNumber}:</span> {baseAvg.toFixed(2)} ({baseInstanceData.response_count} responses)
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Period {comparisonPeriodNumber}:</span> {comparisonAvg.toFixed(2)} ({comparisonInstanceData.response_count} responses)
            </p>
            <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-1">
              <span className="font-medium">Change:</span> 
              <span className={`flex items-center ${change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "text-gray-500"}`}>
                {change > 0 ? "+" : ""}{change.toFixed(2)}
                {change > 0 ? <ArrowUp className="ml-1 h-3 w-3" /> : change < 0 ? <ArrowDown className="ml-1 h-3 w-3" /> : <Minus className="ml-1 h-3 w-3" />}
              </span>
              <span className="text-gray-500">
                ({change > 0 ? "+" : ""}{changePercentage.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Determine colors based on values and changes
  const getBaseColor = (value: number) => {
    if (value >= 4) return "#22c55e80"; // green with transparency
    if (value >= 3) return "#facc1580"; // yellow with transparency
    return "#ef444480"; // red with transparency
  };

  const getComparisonColor = (value: number) => {
    if (value >= 4) return "#22c55e"; // green
    if (value >= 3) return "#facc15"; // yellow
    return "#ef4444"; // red
  };

  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 30, left: 30, bottom: 5 }}
          barGap={16}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" hide />
          <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={3} stroke="#666" strokeDasharray="3 3" label={{ value: "Neutral", position: "left", fill: "#666", fontSize: 12 }} />
          <Bar 
            dataKey="base" 
            name={`Period ${basePeriodNumber || '-'}`} 
            fill={getBaseColor(baseAvg)} 
            radius={[4, 4, 0, 0]} 
            barSize={60}
            label={{ 
              position: 'top', 
              fill: '#666', 
              fontSize: 12,
              formatter: () => baseAvg.toFixed(2)
            }} 
          />
          <Bar 
            dataKey="comparison" 
            name={`Period ${comparisonPeriodNumber || '-'}`} 
            fill={getComparisonColor(comparisonAvg)} 
            radius={[4, 4, 0, 0]} 
            barSize={60}
            label={{ 
              position: 'top', 
              fill: '#666', 
              fontSize: 12,
              formatter: () => comparisonAvg.toFixed(2)
            }} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
