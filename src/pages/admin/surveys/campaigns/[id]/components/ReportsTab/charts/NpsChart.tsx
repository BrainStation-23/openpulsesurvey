
import { NpsData } from "../types/nps";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

interface NpsChartProps {
  data: NpsData;
}

export function NpsChart({ data }: NpsChartProps) {
  const chartData = [
    { name: 'Detractors (0-6)', value: data.detractors, color: '#ef4444' },
    { name: 'Passives (7-8)', value: data.passives, color: '#f59e0b' },
    { name: 'Promoters (9-10)', value: data.promoters, color: '#22c55e' }
  ];
  
  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-4">
        <div className="text-6xl font-bold" style={{ 
          color: data.nps_score >= 50 ? '#22c55e' : data.nps_score >= 0 ? '#f59e0b' : '#ef4444'
        }}>
          {Math.round(data.nps_score)}
        </div>
        <div className="text-xl text-gray-500">NPS Score</div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
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
