
import { BooleanResponseData } from "../../PresentationView/types/responses";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

interface BooleanChartsProps {
  data: BooleanResponseData;
}

export function BooleanCharts({ data }: BooleanChartsProps) {
  const total = data.yes + data.no;
  const yesPercent = Math.round((data.yes / total) * 100) || 0;
  const noPercent = Math.round((data.no / total) * 100) || 0;
  
  const chartData = [
    { name: 'Yes', value: data.yes, color: '#22c55e' },
    { name: 'No', value: data.no, color: '#ef4444' }
  ];
  
  return (
    <div className="space-y-8">
      <div className="flex justify-center gap-8">
        <div className="flex flex-col items-center">
          <div className="text-4xl font-bold text-green-500">{yesPercent}%</div>
          <div className="text-lg text-gray-500">Yes</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-4xl font-bold text-red-500">{noPercent}%</div>
          <div className="text-lg text-gray-500">No</div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
