import { NpsChart } from "../../../../ReportsTab/charts/NpsChart";
import { SatisfactionDonutChart } from "../../../../ReportsTab/charts/SatisfactionDonutChart";
import { RatingResponseData } from "../../types/responses";

interface RatingQuestionViewProps {
  data: RatingResponseData;
  isNps: boolean;
}

export function RatingQuestionView({ data, isNps }: RatingQuestionViewProps) {
  return (
    <div className="w-full max-w-4xl">
      {isNps ? (
        <NpsChart data={data} />
      ) : (
        <SatisfactionDonutChart data={data as any} />
      )}
    </div>
  );
}