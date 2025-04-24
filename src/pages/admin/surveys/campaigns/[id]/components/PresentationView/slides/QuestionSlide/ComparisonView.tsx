
import { HeatMapChart } from "../../../ReportsTab/charts/HeatMapChart";
import { NpsChart } from "../../../ReportsTab/charts/NpsChart";
import { NpsComparisonData } from "../../../ReportsTab/types/nps";
import { GroupedBarChart } from "../../../ReportsTab/charts/GroupedBarChart";

interface ComparisonViewProps {
  data: any;
  isNps: boolean;
}

interface BooleanComparisonData {
  dimension: string;
  yes_count: number;
  no_count: number;
  total_count: number;
}

export function ComparisonView({ data, isNps }: ComparisonViewProps) {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <div className="text-center text-muted-foreground">
        No comparison data available
      </div>
    );
  }

  // Check if the data is boolean comparison data
  const isBooleanData = Array.isArray(data) && data.length > 0 && 'yes_count' in data[0];

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
