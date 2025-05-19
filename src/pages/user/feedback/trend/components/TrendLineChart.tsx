
import React from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from "recharts";

interface TrendDataPoint {
  period_number: number;
  value: number;
  responseCount: number;
  instanceId: string;
}

interface TrendLineChartProps {
  data: TrendDataPoint[];
  title: string;
  questionType: 'rating' | 'boolean';
  color?: string;
}

export function TrendLineChart({ 
  data, 
  title, 
  questionType,
  color = "#3b82f6" 
}: TrendLineChartProps) {
  
  if (!data || data.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 bg-slate-50/50 rounded-lg">
        No trend data available for this question
      </div>
    );
  }
  
  // Sort data by period number
  const sortedData = [...data].sort((a, b) => a.period_number - b.period_number);
  
  // Format tooltip content
  const formatTooltip = (value: number, name: string, props: any) => {
    if (name === 'value') {
      if (questionType === 'boolean') {
        return [`${value.toFixed(1)}%`, 'Yes Percentage'];
      } else {
        return [`${value.toFixed(1)}`, 'Average Rating'];
      }
    }
    return [value, name];
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="w-full bg-slate-50/50 rounded-lg p-4">
        <div className="aspect-[2/1] w-full">
          <ChartContainer config={{
            value: { color }
          }}>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart 
                data={sortedData} 
                margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="period_number" 
                  label={{ value: 'Period', position: 'insideBottomRight', offset: -10 }} 
                />
                <YAxis 
                  domain={questionType === 'boolean' ? [0, 100] : [0, 5]} 
                  label={{ 
                    value: questionType === 'boolean' ? 'Yes %' : 'Rating Avg', 
                    angle: -90, 
                    position: 'insideLeft' 
                  }} 
                />
                <ChartTooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    
                    return (
                      <ChartTooltipContent 
                        active={active} 
                        payload={payload} 
                        label={`Period ${label}`}
                      />
                    );
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  name={questionType === 'boolean' ? 'Yes Percentage' : 'Average Rating'}
                  stroke={color} 
                  strokeWidth={2}
                  dot={{ fill: color, r: 4 }}
                  activeDot={{ r: 6, fill: color }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        <div className="mt-2 text-xs text-slate-500 text-center">
          Based on {data.length} periods
        </div>
      </div>
    </div>
  );
}
