
import { HeatMapChart } from "../../../ReportsTab/charts/HeatMapChart";
import { NpsChart } from "../../../ReportsTab/charts/NpsChart";

interface ComparisonViewProps {
  data: any;
  isNps: boolean;
  dimensionTitle: string;
  questionType?: string;
}

export function ComparisonView({ data, isNps, dimensionTitle, questionType }: ComparisonViewProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No comparison data available
      </div>
    );
  }

  // Handle NPS data (rating with scale 0-10)
  if (isNps) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {data.map((groupData: any) => (
          <div key={groupData.dimension} className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">{groupData.dimension}</h3>
            <NpsChart 
              data={[
                { rating: 0, count: groupData.detractors || 0 },
                { rating: 7, count: groupData.passives || 0 },
                { rating: 9, count: groupData.promoters || 0 }
              ]} 
            />
          </div>
        ))}
      </div>
    );
  }

  // Handle regular rating data (scale 1-5)
  if (questionType === "rating") {
    // Use heat map for regular rating questions
    return <HeatMapChart data={data} title={dimensionTitle} />;
  }

  // Fallback view for other question types
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {data.map((groupData: any) => (
        <div key={groupData.dimension} className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">{groupData.dimension}</h3>
          <div className="text-center">
            <p>Total responses: {groupData.total || 0}</p>
            {groupData.avg_rating !== null && (
              <p>Average rating: {groupData.avg_rating.toFixed(1)}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
