
import { HeatMapChart } from "../../../ReportsTab/charts/HeatMapChart";
import { NpsChart } from "../../../ReportsTab/charts/NpsChart";
import { NpsComparisonData } from "../../../ReportsTab/types/nps";

interface ComparisonViewProps {
  data: any;
  isNps: boolean;
}

export function ComparisonView({ data, isNps }: ComparisonViewProps) {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <div className="text-center text-muted-foreground">
        No comparison data available
      </div>
    );
  }

  return (
    <div className="w-full">
      {isNps ? (
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
      ) : (
        <HeatMapChart data={data} />
      )}
    </div>
  );
}
