
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface BooleanComparisonChartProps {
  baseInstanceData: {
    yes_percentage: number;
    response_count: number;
  };
  comparisonInstanceData: {
    yes_percentage: number;
    response_count: number;
  };
  questionKey: string;
  basePeriodNumber?: number;
  comparisonPeriodNumber?: number;
}

export function BooleanComparisonChart({
  baseInstanceData,
  comparisonInstanceData,
  questionKey,
  basePeriodNumber,
  comparisonPeriodNumber
}: BooleanComparisonChartProps) {
  const basePeriodLabel = basePeriodNumber ? `Period ${basePeriodNumber}` : 'Base';
  const comparisonPeriodLabel = comparisonPeriodNumber ? `Period ${comparisonPeriodNumber}` : 'Comparison';
  
  const data = [
    {
      name: 'Yes',
      [basePeriodLabel]: baseInstanceData.yes_percentage,
      [comparisonPeriodLabel]: comparisonInstanceData.yes_percentage,
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
        <XAxis type="number" domain={[0, 100]} tickCount={6} unit="%" />
        <YAxis type="category" dataKey="name" hide />
        <Tooltip 
          formatter={(value: any) => [`${value.toFixed(2)}%`, 'Yes Percentage']}
        />
        <Legend />
        <Bar dataKey={basePeriodLabel} fill="#8884d8" name={basePeriodLabel} />
        <Bar dataKey={comparisonPeriodLabel} fill="#82ca9d" name={comparisonPeriodLabel} />
      </BarChart>
    </ResponsiveContainer>
  );
}
