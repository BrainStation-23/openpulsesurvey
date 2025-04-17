
import { HeatMapChart } from "../../../ReportsTab/charts/HeatMapChart";
import { NpsChart } from "../../../ReportsTab/charts/NpsChart";

interface ComparisonViewProps {
  data: any;
  isNps: boolean;
}

export function ComparisonView({ data, isNps }: ComparisonViewProps) {
  if (!data || data.length === 0) {
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
          {data.map((groupData: any) => (
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
      ) : (
        <HeatMapChart data={data} />
      )}
    </div>
  );
}
