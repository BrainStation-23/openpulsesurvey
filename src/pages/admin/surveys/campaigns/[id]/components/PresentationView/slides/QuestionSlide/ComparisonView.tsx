
import { HeatMapChart } from "../../../ReportsTab/charts/HeatMapChart";
import { NpsChart } from "../../../ReportsTab/charts/NpsChart";
import { NpsComparisonGroup, SatisfactionComparisonGroup } from "../../types/responses";

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

  // For NPS view, we expect an array of data points with NPS structure
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

    // Check if data has NPS properties to confirm it's NpsComparisonGroup
    if (!('detractors' in data[0] && 'passives' in data[0] && 'promoters' in data[0])) {
      console.warn("Data does not match NpsComparisonGroup format:", data[0]);
      return (
        <div className="text-center text-muted-foreground">
          Invalid NPS comparison data format
        </div>
      );
    }

    // Cast data to the correct type
    const npsData = data as NpsComparisonGroup[];

    return (
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {npsData.map((groupData) => (
            <div key={groupData.dimension} className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold mb-4">{groupData.dimension}</h3>
              <NpsChart 
                data={[
                  { rating: 0, count: groupData.detractors },
                  { rating: 7, count: groupData.passives },
                  { rating: 9, count: groupData.promoters }
                ]} 
              />
              <div className="text-center mt-2">
                <span className={`font-semibold ${groupData.npsScore >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  NPS Score: {groupData.npsScore}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // For Satisfaction view, we expect an array of data points with satisfaction structure
  if (Array.isArray(data) && data.length > 0 && 'satisfied' in data[0] && 'unsatisfied' in data[0]) {
    const satisfactionData = data as SatisfactionComparisonGroup[];
    
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {satisfactionData.map((groupData) => (
            <div key={groupData.dimension} className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold mb-4">{groupData.dimension}</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Satisfied:</span>
                  <span className="font-medium text-green-600">
                    {groupData.satisfied} ({Math.round((groupData.satisfied / groupData.total) * 100)}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Neutral:</span>
                  <span className="font-medium text-yellow-600">
                    {groupData.neutral} ({Math.round((groupData.neutral / groupData.total) * 100)}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Unsatisfied:</span>
                  <span className="font-medium text-red-600">
                    {groupData.unsatisfied} ({Math.round((groupData.unsatisfied / groupData.total) * 100)}%)
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t">
                  <div className="flex justify-between">
                    <span>Median:</span>
                    <span className="font-semibold">{groupData.median.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span>{groupData.total} responses</span>
                  </div>
                </div>
              </div>
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
