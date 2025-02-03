import { BooleanCharts } from "../../../../ReportsTab/charts/BooleanCharts";
import { BooleanResponseData } from "../../types/responses";

interface BooleanQuestionViewProps {
  data: BooleanResponseData;
}

export function BooleanQuestionView({ data }: BooleanQuestionViewProps) {
  return (
    <div className="w-full max-w-4xl">
      <BooleanCharts data={data} />
    </div>
  );
}