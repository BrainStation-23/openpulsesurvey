
import { 
  RatingScaleChart, 
  NpsScaleChart, 
  SatisfactionScaleChart 
} from "../../../ReportsTab/charts/RatingScaleChart";
import { 
  RatingResponseData, 
  SatisfactionData 
} from "../../types/responses";
import { isNpsQuestion } from "../../types/questionTypes";

interface RatingQuestionViewProps {
  data: RatingResponseData | SatisfactionData;
  question: any;
}

export function RatingQuestionView({ data, question }: RatingQuestionViewProps) {
  // Check if the question is NPS either by rateCount or using the isNpsQuestion helper
  const isNps = question.rateCount === 10 || (question.mode === 'nps');

  return (
    <div className="w-full max-w-4xl">
      {isNps ? (
        <NpsScaleChart data={data as RatingResponseData} />
      ) : (
        <SatisfactionScaleChart data={data as SatisfactionData} />
      )}
    </div>
  );
}
