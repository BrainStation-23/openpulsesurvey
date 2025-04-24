
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "recharts";
import { DemographicBreakdownItem } from "../types";

interface DemographicBarChartProps {
  data: DemographicBreakdownItem[] | any[];
  title: string;
  nameKey?: string;
  valueKey?: string;
  colors?: string[];
}

export function DemographicBarChart({ 
  data, 
  title, 
  nameKey = "name", 
  valueKey = "count", 
  colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c'] 
}: DemographicBarChartProps) {
  // Format data for the chart
  const chartData = data.map(item => ({
    name: item[nameKey],
    value: item[valueKey],
    percentage: item.percentage ? `${item.percentage.toFixed(1)}%` : undefined
  }));

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={80}
              tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 12)}...` : value}
            />
            <Tooltip
              formatter={(value, name, props) => {
                return [
                  `Count: ${value}`,
                  props.payload.percentage ? `Percentage: ${props.payload.percentage}` : ''
                ];
              }}
              labelFormatter={(value) => value}
            />
            <Legend />
            <Bar dataKey="value" name="Count">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
