
import { SatisfactionData } from "../../PresentationView/types/responses";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "recharts";

interface SatisfactionChartProps {
  data: SatisfactionData;
}

export function SatisfactionChart({ data }: SatisfactionChartProps) {
  const chartData = [
    { name: 'Unsatisfied (1-2)', value: data.unsatisfied, color: '#ef4444' },
    { name: 'Neutral (3)', value: data.neutral, color: '#f59e0b' },
    { name: 'Satisfied (4-5)', value: data.satisfied, color: '#22c55e' }
  ];
  
  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-4">
        {data.median && (
          <div className="mb-2">
            <div className="text-5xl font-bold text-blue-500">
              {data.median.toFixed(1)}
            </div>
            <div className="text-gray-500">Median Rating</div>
          </div>
        )}
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" name="Responses">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
