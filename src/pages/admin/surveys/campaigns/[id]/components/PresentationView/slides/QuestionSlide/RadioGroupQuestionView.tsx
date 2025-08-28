
import { RadioGroupChart } from "../../../ReportsTab/charts/RadioGroupChart";

interface RadioGroupResponseData {
  name: string;
  value: number;
  percentage: number;
}

interface RadioGroupQuestionViewProps {
  data: RadioGroupResponseData[];
}

export function RadioGroupQuestionView({ data }: RadioGroupQuestionViewProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No responses yet
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl">
      <RadioGroupChart 
        data={data}
        chartType="bar"
      />
    </div>
  );
}
