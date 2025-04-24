
import { NpsData } from "../../../ReportsTab/types/nps";
import { NpsDonutChart } from "../../../ReportsTab/components/charts/NpsDonutChart";
import { SatisfactionData } from "../../types/responses";
import { SatisfactionDonutChart } from "../../../ReportsTab/components/charts/SatisfactionDonutChart";

interface RatingQuestionViewProps {
  data: any; // Using any here as we need to handle both NPS and satisfaction data
  isNps: boolean;
}

export function RatingQuestionView({ data, isNps }: RatingQuestionViewProps) {
  if (!data) {
    return (
      <div className="text-center text-muted-foreground">
        No responses yet
      </div>
    );
  }

  if (isNps) {
    const npsData = data as NpsData;
    
    if (npsData.total === 0) {
      return (
        <div className="text-center text-muted-foreground">
          No responses yet
        </div>
      );
    }

    return (
      <div className="w-full max-w-xl">
        <NpsDonutChart 
          npsData={npsData} 
          showLegend={true}
          showScore={true}
        />
      </div>
    );
  } else {
    // For satisfaction data (non-NPS ratings)
    const satisfactionData = data as SatisfactionData;
    
    if (satisfactionData.total === 0) {
      return (
        <div className="text-center text-muted-foreground">
          No responses yet
        </div>
      );
    }

    return (
      <div className="w-full max-w-xl">
        <SatisfactionDonutChart 
          data={satisfactionData}
          showLegend={true}
        />
      </div>
    );
  }
}
