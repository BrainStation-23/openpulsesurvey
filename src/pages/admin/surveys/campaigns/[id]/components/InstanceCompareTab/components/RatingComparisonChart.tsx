
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface RatingComparisonChartProps {
  baseInstanceData: {
    avg_numeric_value: number;
    response_count: number;
  };
  comparisonInstanceData: {
    avg_numeric_value: number;
    response_count: number;
  };
  questionKey: string;
  basePeriodNumber?: number;
  comparisonPeriodNumber?: number;
}

export function RatingComparisonChart({
  baseInstanceData,
  comparisonInstanceData,
  questionKey,
  basePeriodNumber,
  comparisonPeriodNumber
}: RatingComparisonChartProps) {
  const basePeriodLabel = basePeriodNumber ? `Period ${basePeriodNumber}` : 'Base';
  const comparisonPeriodLabel = comparisonPeriodNumber ? `Period ${comparisonPeriodNumber}` : 'Comparison';
  
  const data = [
    {
      name: 'Rating',
      [basePeriodLabel]: baseInstanceData.avg_numeric_value,
      [comparisonPeriodLabel]: comparisonInstanceData.avg_numeric_value,
    }
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
        barSize={60}
        layout="vertical"
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" domain={[0, 5]} tickCount={6} />
        <YAxis type="category" dataKey="name" hide />
        <Tooltip 
          formatter={(value: any) => [`${value.toFixed(2)}`, 'Avg Rating']}
        />
        <Legend />
        <Bar dataKey={basePeriodLabel} fill="#8884d8" name={basePeriodLabel} />
        <Bar dataKey={comparisonPeriodLabel} fill="#82ca9d" name={comparisonPeriodLabel} />
      </BarChart>
    </ResponsiveContainer>
  );
}
