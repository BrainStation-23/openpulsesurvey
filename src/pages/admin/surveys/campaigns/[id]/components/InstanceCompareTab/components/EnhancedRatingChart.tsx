import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip, TooltipProps, ReferenceLine } from "recharts";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface RatingComparisonData {
  avg_numeric_value: number;
  response_count: number;
}

interface EnhancedRatingChartProps {
  baseInstanceData: RatingComparisonData;
  comparisonInstanceData: RatingComparisonData;
  basePeriodNumber?: number;
  comparisonPeriodNumber?: number;
  questionKey: string;
}

export function EnhancedRatingChart({
  baseInstanceData,
  comparisonInstanceData,
  basePeriodNumber,
  comparisonPeriodNumber,
  questionKey
}: EnhancedRatingChartProps) {
  const baseAvg = baseInstanceData.avg_numeric_value;
  const comparisonAvg = comparisonInstanceData.avg_numeric_value;
  const change = comparisonAvg - baseAvg;
  const changePercentage = (change / baseAvg) * 100;
  
  const isSignificantChange = Math.abs(changePercentage) > 5 || Math.abs(change) > 0.5;
  
  const data = [
    {
      name: "Rating",
      base: baseAvg,
      comparison: comparisonAvg,
      basePeriod: basePeriodNumber,
      comparisonPeriod: comparisonPeriodNumber,
    },
  ];
  
  const distributionData = Array.from({ length: 5 }, (_, i) => ({
    rating: i + 1,
    basePct: 0,
    comparisonPct: 0,
  }));
  
  distributionData.forEach((item, i) => {
    item.basePct = simulateDistribution(baseAvg, distributionData)[i];
    item.comparisonPct = simulateDistribution(comparisonAvg, distributionData)[i];
  });
  
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

  const getBaseColor = (value: number) => {
    if (value > 4) return "#22c55e";
    if (value > 3) return "#84cc16";
    if (value > 2) return "#facc15";
    if (value > 1) return "#f97316";
    return "#ef4444";
  };

  const getComparisonColor = (value: number) => {
    if (value > 4) return "#22c55e";
    if (value > 3) return "#84cc16";
    if (value > 2) return "#facc15";
    if (value > 1) return "#f97316";
    return "#ef4444";
  };

  const simulateDistribution = (avg: number, data: any[]) => {
    const total = 100;
    const center = Math.round(avg);
    const centerWeight = 0.4;
    const adjacentWeight = 0.25;
    const otherWeight = 0.05;

    data.forEach((item) => {
      const rating = item.rating;
      let weight;

      if (rating === center) {
        weight = centerWeight;
      } else if (Math.abs(rating - center) === 1) {
        weight = adjacentWeight;
      } else {
        weight = otherWeight;
      }

      return weight * total;
    });

    return data;
  };

  return (
    <div className="space-y-6">
      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
            barGap={10}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis type="number" domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
            <YAxis type="category" dataKey="name" hide />
            <Tooltip 
              content={({ active, payload }) => {
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
              }}
            />
            <ReferenceLine x={3} stroke="#666" strokeDasharray="3 3" label={{ value: "Neutral", position: "top", fill: "#666", fontSize: 12 }} />
            <Bar 
              dataKey="base" 
              name={`Period ${basePeriodNumber || '-'}`} 
              fill={getBaseColor(baseAvg)} 
              radius={[0, 4, 4, 0]} 
              barSize={40}
              label={{ 
                position: 'right', 
                fill: '#666', 
                fontSize: 12,
                formatter: () => baseAvg.toFixed(2)
              }}
            >
              <Cell fill={getBaseColor(baseAvg)} fillOpacity={0.7} />
            </Bar>
            <Bar 
              dataKey="comparison" 
              name={`Period ${comparisonPeriodNumber || '-'}`} 
              fill={getComparisonColor(comparisonAvg)} 
              radius={[0, 4, 4, 0]} 
              barSize={40}
              label={{ 
                position: 'right', 
                fill: '#666', 
                fontSize: 12,
                formatter: () => comparisonAvg.toFixed(2)
              }}
            >
              <Cell fill={getComparisonColor(comparisonAvg)} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Card className={`bg-gradient-to-br ${change >= 0 ? "from-green-50 to-green-100 border-green-200" : "from-red-50 to-red-100 border-red-200"}`}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-gray-800 font-medium">Average Rating</h4>
                <p className="text-2xl font-bold mt-1">{comparisonAvg.toFixed(2)}</p>
                <div className={`mt-1 text-sm flex items-center ${change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "text-gray-500"}`}>
                  {change > 0 ? "+" : ""}{change.toFixed(2)}
                  {change > 0 ? <ArrowUp className="ml-1 h-3 w-3" /> : change < 0 ? <ArrowDown className="ml-1 h-3 w-3" /> : <Minus className="ml-1 h-3 w-3" />}
                  <span className="text-gray-500 ml-1">from {baseAvg.toFixed(2)}</span>
                </div>
              </div>
              <div className={`p-2 rounded-full ${change >= 0 ? "bg-green-100" : "bg-red-100"}`}>
                {change >= 0 ? <ArrowUp className="h-5 w-5 text-green-600" /> : <ArrowDown className="h-5 w-5 text-red-600" />}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-gray-800 font-medium">Response Count</h4>
                <p className="text-2xl font-bold mt-1">{comparisonInstanceData.response_count}</p>
                <div className="mt-1 text-sm flex items-center">
                  <span className="text-gray-500">vs {baseInstanceData.response_count} previously</span>
                </div>
              </div>
              <div className="p-2 rounded-full bg-blue-100">
                <span className="h-5 w-5 flex items-center justify-center text-blue-600 font-medium">#</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
