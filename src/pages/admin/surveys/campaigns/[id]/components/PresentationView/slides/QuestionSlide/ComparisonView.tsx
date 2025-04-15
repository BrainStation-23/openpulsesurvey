
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

  // For NPS view, we expect an array of data points
  if (isNps) {
    // Ensure data is an array for NPS view
    if (!Array.isArray(data)) {
      console.warn("Expected array data for NPS comparison view but received:", data);
      return (
        <div className="text-center text-muted-foreground">
          Invalid data format for NPS comparison view
        </div>
      );
    }

    // Check if array is empty
    if (data.length === 0) {
      return (
        <div className="text-center text-muted-foreground">
          No NPS comparison data available
        </div>
      );
    }

    return (
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {data.map((groupData) => (
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
          ))}
        </div>
      </div>
    );
  }

  // For HeatMap view, we need to ensure the data is in the expected format
  return (
    <div className="w-full">
      <HeatMapChart data={data} />
    </div>
  );
}
