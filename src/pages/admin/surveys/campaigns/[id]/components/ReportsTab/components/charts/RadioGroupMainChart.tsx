
import { RadioGroupChart } from "../../charts/RadioGroupChart";
import { RadioGroupComparisonData } from "../../types/comparison";

interface RadioGroupMainChartProps {
  data: RadioGroupComparisonData[];
}

export function RadioGroupMainChart({ data }: RadioGroupMainChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No responses yet
      </div>
    );
  }

  // Take the first item (overall data when dimension is empty)
  const overallData = data[0];
  if (!overallData || !overallData.choice_data) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No responses yet
      </div>
    );
  }

  // Transform RPC data to chart format
  const chartData = overallData.choice_data.map(choice => ({
    name: choice.choice_text || choice.choice_value,
    value: choice.count,
    percentage: choice.percentage
  }));

  return (
    <div className="w-full">
      <RadioGroupChart 
        data={chartData}
        chartType="bar"
      />
    </div>
  );
}
