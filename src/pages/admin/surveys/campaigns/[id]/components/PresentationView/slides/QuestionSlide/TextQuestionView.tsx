import { WordCloud } from "../../../ReportsTab/charts/WordCloud";
import { TextResponseData } from "../../types/responses";

interface TextQuestionViewProps {
  data: TextResponseData;
}

export function TextQuestionView({ data }: TextQuestionViewProps) {
  return (
    <div className="w-full max-w-4xl min-h-[400px]">
      <WordCloud words={data} />
    </div>
  );
}