
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, TooltipProps, Cell, ReferenceLine } from "recharts";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

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
}

export function BooleanComparisonChart({
  baseInstanceData,
  comparisonInstanceData,
  questionKey,
  basePeriodNumber,
  comparisonPeriodNumber
}: BooleanComparisonChartProps) {

  // Calculate percentages
  const baseYes = baseInstanceData.yes_percentage;
  const baseNo = 100 - baseYes;
  const comparisonYes = comparisonInstanceData.yes_percentage;
  const comparisonNo = 100 - comparisonYes;
  
  // Change metrics
  const change = comparisonYes - baseYes;
  const isSignificantChange = Math.abs(change) > 5;

  // Prepare data for the chart
  const data = [
    { 
      name: "Yes", 
      base: baseYes, 
      comparison: comparisonYes,
      baseCount: Math.round(baseInstanceData.response_count * baseYes / 100),
      comparisonCount: Math.round(comparisonInstanceData.response_count * comparisonYes / 100)
    },
    { 
      name: "No", 
      base: baseNo, 
      comparison: comparisonNo,
      baseCount: Math.round(baseInstanceData.response_count * baseNo / 100),
      comparisonCount: Math.round(comparisonInstanceData.response_count * comparisonNo / 100)
    }
  ];

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-medium text-gray-900">{item.name} Responses</p>
          <div className="text-sm space-y-1 mt-1">
            <p className="text-gray-600">
              <span className="font-medium">Period {basePeriodNumber}:</span> {item.base.toFixed(1)}% ({item.baseCount} responses)
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Period {comparisonPeriodNumber}:</span> {item.comparison.toFixed(1)}% ({item.comparisonCount} responses)
            </p>
            <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-1">
              <span className="font-medium">Change:</span> 
              <span className={`flex items-center ${
                item.name === "Yes" ? 
                  (change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "text-gray-500") :
                  (change < 0 ? "text-green-600" : change > 0 ? "text-red-600" : "text-gray-500")
              }`}>
                {item.name === "Yes" ? 
                  (change > 0 ? "+" : "") + change.toFixed(1) + "%" :
                  (change < 0 ? "+" : "") + (-change).toFixed(1) + "%"
                }
                {item.name === "Yes" ? 
                  (change > 0 ? <ArrowUp className="ml-1 h-3 w-3" /> : change < 0 ? <ArrowDown className="ml-1 h-3 w-3" /> : <Minus className="ml-1 h-3 w-3" />) :
                  (change < 0 ? <ArrowUp className="ml-1 h-3 w-3" /> : change > 0 ? <ArrowDown className="ml-1 h-3 w-3" /> : <Minus className="ml-1 h-3 w-3" />)
                }
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
          <YAxis dataKey="name" type="category" />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x={50} stroke="#666" strokeDasharray="3 3" />
          <Bar dataKey="base" name={`Period ${basePeriodNumber || '-'}`} fill="#94a3b8" radius={[0, 0, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-base-${index}`} fill={index === 0 ? "#4ade80" : "#f87171"} fillOpacity={0.6} />
            ))}
          </Bar>
          <Bar dataKey="comparison" name={`Period ${comparisonPeriodNumber || '-'}`} fill="#64748b" radius={[4, 4, 4, 4]}>
            {data.map((entry, index) => (
              <Cell key={`cell-comparison-${index}`} fill={index === 0 ? "#22c55e" : "#ef4444"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
