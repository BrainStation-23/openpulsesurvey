
import { HeatMapChart } from "../../../ReportsTab/charts/HeatMapChart";
import { NpsScaleChart } from "../../../ReportsTab/charts/RatingScaleChart";
import { isNpsQuestion } from "../../types/questionTypes";

interface ComparisonViewProps {
  data: any;
  question: any;
}

export function ComparisonView({ data, question }: ComparisonViewProps) {
  const isNps = isNpsQuestion(question);

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
              <NpsScaleChart 
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
