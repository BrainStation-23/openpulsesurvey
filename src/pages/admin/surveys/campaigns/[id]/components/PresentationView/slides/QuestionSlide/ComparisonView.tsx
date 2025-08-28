
import { HeatMapChart } from "../../../ReportsTab/charts/HeatMapChart";
import { NpsChart } from "../../../ReportsTab/charts/NpsChart";
import { NpsComparisonData } from "../../../ReportsTab/types/nps";
import { GroupedBarChart } from "../../../ReportsTab/charts/GroupedBarChart";
import { RadioGroupComparisonData } from "../../../ReportsTab/types/comparison";

interface ComparisonViewProps {
  data: any;
  isNps: boolean;
  isRadioGroup?: boolean;
}

interface BooleanComparisonData {
  dimension: string;
  yes_count: number;
  no_count: number;
  total_count: number;
}

export function ComparisonView({ data, isNps, isRadioGroup }: ComparisonViewProps) {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <div className="text-center text-muted-foreground">
        No comparison data available
      </div>
    );
  }

  // Check if the data is boolean comparison data
  const isBooleanData = Array.isArray(data) && data.length > 0 && 'yes_count' in data[0];

  // Check if the data is radiogroup comparison data
  const isRadioGroupData = Array.isArray(data) && data.length > 0 && 'choice_data' in data[0];

  if (isBooleanData) {
    const chartData = data.map((item: BooleanComparisonData) => ({
      name: item.dimension,
      Yes: item.yes_count,
      No: item.no_count
    }));

    return (
      <div className="w-full overflow-x-auto max-w-full">
        <GroupedBarChart 
          data={chartData}
          keys={["Yes", "No"]}
          colors={["#22c55e", "#ef4444"]} // Green for Yes, Red for No
          height={320}
        />
      </div>
    );
  }

  if (isRadioGroupData) {
    // For radiogroup data, create a grouped bar chart with all choices
    const allChoices = new Set<string>();
    data.forEach((item: RadioGroupComparisonData) => {
      item.choice_data.forEach(choice => {
        allChoices.add(choice.choice_text);
      });
    });

    const chartData = data.map((item: RadioGroupComparisonData) => {
      const dimensionData: any = { name: item.dimension };
      item.choice_data.forEach(choice => {
        dimensionData[choice.choice_text] = choice.count;
      });
      return dimensionData;
    });

    const colors = ["#3b82f6", "#22c55e", "#eab308", "#ef4444", "#8b5cf6", "#f97316"];

    return (
      <div className="w-full overflow-x-auto max-w-full">
        <GroupedBarChart 
          data={chartData}
          keys={Array.from(allChoices)}
          colors={colors}
          height={320}
        />
      </div>
    );
  }

  if (isNps) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.isArray(data) && data.map((groupData: NpsComparisonData) => (
          <div key={groupData.dimension} className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">{groupData.dimension}</h3>
            <NpsChart 
              data={groupData} 
            />
          </div>
        ))}
      </div>
    );
  }

  return <HeatMapChart data={data} />;
}
