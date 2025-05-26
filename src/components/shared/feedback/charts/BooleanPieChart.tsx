
import React from 'react';
import { PieChart, Pie, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';

interface BooleanPieChartProps {
  trueCount: number;
  falseCount: number;
  chartConfig: ChartConfig;
}

export function BooleanPieChart({ trueCount, falseCount, chartConfig }: BooleanPieChartProps) {
  const total = trueCount + falseCount;
  
  // For boolean questions, use a pie chart for consistency
  const data = [
    { name: 'boolean-yes', value: trueCount, percentage: total > 0 ? (trueCount / total) * 100 : 0 },
    { name: 'boolean-no', value: falseCount, percentage: total > 0 ? (falseCount / total) * 100 : 0 }
  ];
  
  const COLORS = ['#10B981', '#EF4444'];
  
  return (
    <div className="w-full h-full">
      <ChartContainer config={chartConfig} className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, value, percent }) => `${name === 'boolean-yes' ? 'Yes' : 'No'}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                `${value} (${(data.find(item => item.name === name)?.percentage || 0).toFixed(0)}%)`, 
                name === 'boolean-yes' ? 'Yes' : 'No'
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
