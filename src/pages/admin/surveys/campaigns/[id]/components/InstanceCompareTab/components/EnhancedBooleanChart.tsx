
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Cell, Tooltip, TooltipProps } from "recharts";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface BooleanComparisonData {
  yes_percentage: number;
  response_count: number;
}

interface EnhancedBooleanChartProps {
  baseInstanceData: BooleanComparisonData;
  comparisonInstanceData: BooleanComparisonData;
  basePeriodNumber?: number;
  comparisonPeriodNumber?: number;
  questionKey: string;
}

export function EnhancedBooleanChart({
  baseInstanceData,
  comparisonInstanceData,
  basePeriodNumber,
  comparisonPeriodNumber,
  questionKey
}: EnhancedBooleanChartProps) {
  const baseYes = baseInstanceData.yes_percentage;
  const baseNo = 100 - baseYes;
  const comparisonYes = comparisonInstanceData.yes_percentage;
  const comparisonNo = 100 - comparisonYes;
  
  const yesChange = comparisonYes - baseYes;
  const isSignificantChange = Math.abs(yesChange) > 5;
  
  const data = [
    {
      name: "Yes",
      base: baseYes,
      comparison: comparisonYes,
      change: yesChange,
    },
    {
      name: "No",
      base: baseNo,
      comparison: comparisonNo,
      change: -yesChange,
    },
  ];

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-medium text-gray-900">{item.name} Responses</p>
          <div className="text-sm space-y-1 mt-1">
            <p className="text-gray-600">
              <span className="font-medium">Period {basePeriodNumber}:</span> {item.base.toFixed(1)}% ({Math.round(baseInstanceData.response_count * (item.name === "Yes" ? baseYes : baseNo) / 100)} responses)
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Period {comparisonPeriodNumber}:</span> {item.comparison.toFixed(1)}% ({Math.round(comparisonInstanceData.response_count * (item.name === "Yes" ? comparisonYes : comparisonNo) / 100)} responses)
            </p>
            <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-1">
              <span className="font-medium">Change:</span> 
              <span className={`flex items-center ${yesChange > 0 ? (item.name === "Yes" ? "text-green-600" : "text-red-600") : yesChange < 0 ? (item.name === "Yes" ? "text-red-600" : "text-green-600") : "text-gray-500"}`}>
                {item.change > 0 ? "+" : ""}{item.change.toFixed(1)}%
                {item.change > 0 ? <ArrowUp className="ml-1 h-3 w-3" /> : item.change < 0 ? <ArrowDown className="ml-1 h-3 w-3" /> : <Minus className="ml-1 h-3 w-3" />}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
            <YAxis dataKey="name" type="category" />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={0} stroke="#666" />
            <Bar dataKey="base" name={`Period ${basePeriodNumber || '-'}`} stackId="a" fill="#94a3b8" radius={[0, 0, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-base-${index}`} fill={index === 0 ? "#4ade80" : "#f87171"} fillOpacity={0.7} />
              ))}
            </Bar>
            <Bar dataKey="comparison" name={`Period ${comparisonPeriodNumber || '-'}`} stackId="b" fill="#64748b" radius={[4, 4, 4, 4]}>
              {data.map((entry, index) => (
                <Cell key={`cell-comparison-${index}`} fill={index === 0 ? "#22c55e" : "#ef4444"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-3">
            <h4 className="text-green-800 font-medium mb-1 flex items-center">
              Yes Responses
              {yesChange !== 0 && (
                <span className={`ml-2 flex items-center text-xs ${yesChange > 0 ? "text-green-600" : "text-red-600"}`}>
                  {yesChange > 0 ? "+" : ""}{yesChange.toFixed(1)}%
                  {yesChange > 0 ? <ArrowUp className="ml-0.5 h-3 w-3" /> : <ArrowDown className="ml-0.5 h-3 w-3" />}
                </span>
              )}
            </h4>
            <div className="flex justify-between mb-1">
              <span className="text-green-700 text-xs">Previous</span>
              <span className="text-green-800 font-semibold">{baseYes.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700 text-xs">Current</span>
              <span className="text-green-800 font-semibold">{comparisonYes.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-3">
            <h4 className="text-red-800 font-medium mb-1 flex items-center">
              No Responses
              {-yesChange !== 0 && (
                <span className={`ml-2 flex items-center text-xs ${-yesChange > 0 ? "text-green-600" : "text-red-600"}`}>
                  {-yesChange > 0 ? "+" : ""}{-yesChange.toFixed(1)}%
                  {-yesChange > 0 ? <ArrowUp className="ml-0.5 h-3 w-3" /> : <ArrowDown className="ml-0.5 h-3 w-3" />}
                </span>
              )}
            </h4>
            <div className="flex justify-between mb-1">
              <span className="text-red-700 text-xs">Previous</span>
              <span className="text-red-800 font-semibold">{baseNo.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-700 text-xs">Current</span>
              <span className="text-red-800 font-semibold">{comparisonNo.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
