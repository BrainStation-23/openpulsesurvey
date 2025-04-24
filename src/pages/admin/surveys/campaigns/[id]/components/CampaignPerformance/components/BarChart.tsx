
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "recharts";

interface BarChartProps {
  data: any[];
  xAxisKey: string;
  yAxisKey: string;
  title?: string;
  colors?: string[];
  labelKey?: string;
}

export function BarChart({ 
  data, 
  xAxisKey, 
  yAxisKey, 
  title,
  colors = ['#8884d8'], 
  labelKey 
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip
          formatter={(value: any, name: string) => {
            return [value, labelKey || name];
          }}
        />
        <Legend />
        <Bar 
          dataKey={yAxisKey} 
          name={labelKey || yAxisKey} 
          fill={colors[0]}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={colors[index % colors.length]} 
            />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
