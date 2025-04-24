
import { NpsChart } from "../../../ReportsTab/charts/NpsChart";
import { SatisfactionDonutChart } from "../../../ReportsTab/charts/SatisfactionDonutChart";
import { RatingResponseData, SatisfactionData } from "../../types/responses";
import { NpsData } from "../../../ReportsTab/types/nps";

interface RatingQuestionViewProps {
  data: RatingResponseData | SatisfactionData | NpsData;
  isNps: boolean;
}

export function RatingQuestionView({ data, isNps }: RatingQuestionViewProps) {
  // Safety check to handle empty data
  if (!data) {
    return <div className="text-center text-muted-foreground">No data available</div>;
  }

  return (
    <div className="w-full max-w-4xl">
      {isNps ? (
        // For NPS data, pass it directly to NpsChart
        <NpsChart data={data as NpsData} />
      ) : (
        // For satisfaction data (5-point scale)
        // We explicitly cast to SatisfactionData as that's what SatisfactionDonutChart expects
        <SatisfactionDonutChart data={data as SatisfactionData} />
      )}
    </div>
  );
}
