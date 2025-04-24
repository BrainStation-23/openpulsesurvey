
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer } from "@/components/ui/chart";

interface SBUPerformanceChartProps {
  data: any[];
}

export function SBUPerformanceChart({ data }: SBUPerformanceChartProps) {
  return (
    <ChartContainer config={{}}>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period_number" />
          <YAxis domain={[0, 5]} />
          <Tooltip />
          <Legend />
          {data?.[0] && Object.keys(data[0])
            .filter(key => key !== 'period_number')
            .map((sbu, index) => (
              <Line
                key={sbu}
                type="monotone"
                dataKey={sbu}
                stroke={`hsl(${index * 30}, 70%, 50%)`}
                strokeWidth={2}
                dot={{ fill: `hsl(${index * 30}, 70%, 50%)` }}
              />
            ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
