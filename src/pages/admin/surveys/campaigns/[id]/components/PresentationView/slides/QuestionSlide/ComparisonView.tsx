
import { HeatMapChart } from "../../../ReportsTab/charts/HeatMapChart";
import { NpsChart } from "../../../ReportsTab/charts/NpsChart";

interface ComparisonViewProps {
  data: any;
  isNps: boolean;
}

export function ComparisonView({ data, isNps }: ComparisonViewProps) {
  // Additional checks to ensure data is in the right format
  if (!data) {
    return (
      <div className="text-center text-muted-foreground">
        No comparison data available
      </div>
    );
  }

  // Check if data is not an array but should be one for this view
  if (isNps && !Array.isArray(data)) {
    console.warn("Expected array data for NPS comparison view but received:", data);
    return (
      <div className="text-center text-muted-foreground">
        Invalid data format for comparison view
      </div>
    );
  }

  return (
    <div className="w-full">
      {isNps ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Only try to map if data is actually an array */}
          {Array.isArray(data) ? data.map((groupData: any) => (
            <div key={groupData.dimension} className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold mb-4">{groupData.dimension}</h3>
              <NpsChart 
                data={[
                  { rating: 0, count: groupData.detractors },
                  { rating: 7, count: groupData.passives },
                  { rating: 9, count: groupData.promoters }
                ]} 
              />
            </div>
          )) : (
            <div className="col-span-full text-center text-muted-foreground">
              No comparison data groups available
            </div>
          )}
        </div>
      ) : (
        <HeatMapChart data={data} />
      )}
    </div>
  );
}
