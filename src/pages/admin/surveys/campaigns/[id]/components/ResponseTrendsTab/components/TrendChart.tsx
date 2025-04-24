
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ResponseTrendData } from '../types';

interface TrendChartProps {
  trends: ResponseTrendData[];
}

export function TrendChart({ trends }: TrendChartProps) {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={trends}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="periodNumber" 
            label={{ value: 'Period', position: 'bottom' }} 
          />
          <YAxis 
            label={{ value: 'Completion Rate (%)', angle: -90, position: 'left' }}
            domain={[0, 100]}
          />
          <Tooltip 
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Completion Rate']}
            labelFormatter={(period) => `Period ${period}`}
          />
          <Line 
            type="monotone" 
            dataKey="completionRate" 
            stroke="#8884d8" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
