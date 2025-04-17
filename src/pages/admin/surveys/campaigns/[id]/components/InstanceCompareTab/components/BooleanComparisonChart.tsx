
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

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
  comparisonPeriodNumber,
}: BooleanComparisonChartProps) {
  const basePeriodLabel = basePeriodNumber ? `Period ${basePeriodNumber}` : "Base";
  const comparisonPeriodLabel = comparisonPeriodNumber ? `Period ${comparisonPeriodNumber}` : "Comparison";

  const data = [
    {
      name: "Yes Responses",
      [basePeriodLabel]: baseInstanceData.yes_percentage,
      [`${basePeriodLabel} Count`]: baseInstanceData.response_count,
      [comparisonPeriodLabel]: comparisonInstanceData.yes_percentage,
      [`${comparisonPeriodLabel} Count`]: comparisonInstanceData.response_count,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
        barSize={60}
        layout="vertical"
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" domain={[0, 100]} unit="%" />
        <YAxis dataKey="name" type="category" />
        <Legend />
        <Bar dataKey={basePeriodLabel} fill="#8884d8">
          <Label position="center" />
        </Bar>
        <Bar dataKey={comparisonPeriodLabel} fill="#82ca9d">
          <Label position="center" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
