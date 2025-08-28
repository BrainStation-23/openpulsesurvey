
import { useDimensionComparison } from "../../hooks/useDimensionComparison";
import { Spinner } from "@/components/ui/spinner";
import { StackedBarChart } from "../../charts/StackedBarChart";
import { RadioGroupComparisonData, ComparisonDimension } from "../../types/comparison";

interface RadioGroupComparisonProps {
  campaignId: string;
  instanceId: string;
  questionName: string;
  dimension: ComparisonDimension;
}

export function RadioGroupComparison({
  campaignId,
  instanceId,
  questionName,
  dimension
}: RadioGroupComparisonProps) {
  const { data, isLoading, error } = useDimensionComparison(
    campaignId,
    instanceId,
    questionName,
    dimension,
    false, // isNps
    false, // isBoolean
    true   // isRadioGroup
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No comparison data available for this dimension.
      </div>
    );
  }

  const comparisonData = data as RadioGroupComparisonData[];

  // Transform data for stacked bar chart
  const chartData = comparisonData.map(item => {
    const result: any = { name: item.dimension };
    
    item.choice_data.forEach(choice => {
      result[choice.choice_text || choice.choice_value] = choice.count;
    });
    
    return result;
  });

  // Get all unique choices for keys
  const allChoices = Array.from(
    new Set(
      comparisonData.flatMap(item => 
        item.choice_data.map(choice => choice.choice_text || choice.choice_value)
      )
    )
  );

  return (
    <div className="w-full">
      <StackedBarChart
        data={chartData}
        keys={allChoices}
        height={400}
        stacked={true}
      />
    </div>
  );
}
