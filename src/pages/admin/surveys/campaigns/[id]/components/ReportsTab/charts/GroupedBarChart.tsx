
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface GroupedBarChartProps {
  data: any[];
  keys: string[];
  colors: string[];
  height?: number;
}

export function GroupedBarChart({ data, keys, colors, height = 400 }: GroupedBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 80,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          angle={-45} 
          textAnchor="end" 
          interval={0} 
          height={80}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        {keys.map((key, index) => (
          <Bar 
            key={key} 
            dataKey={key} 
            fill={colors[index % colors.length]} 
            name={key}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
