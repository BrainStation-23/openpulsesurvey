
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
  const isNps = isNpsQuestion(question);

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
