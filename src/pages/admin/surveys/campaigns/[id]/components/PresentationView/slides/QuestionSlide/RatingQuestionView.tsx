
import React from "react";
import { Chart } from "../../components/Chart";
import { RatingResponseData, SatisfactionData } from "../../types/responses";

interface RatingQuestionViewProps {
  data: RatingResponseData | SatisfactionData;
  isNps?: boolean;
}

export const RatingQuestionView: React.FC<RatingQuestionViewProps> = ({ data, isNps = false }) => {
  // Helper to determine if data is RatingResponseData or SatisfactionData
  const isRatingResponseData = (data: any): data is RatingResponseData => {
    return Array.isArray(data);
  };

  // Helper to determine if data is SatisfactionData
  const isSatisfactionData = (data: any): data is SatisfactionData => {
    return !Array.isArray(data) && 'unsatisfied' in data;
  };

  if (!data) return <div>No data available</div>;

  // Format data for the chart based on its type
  let chartData;
  let chartType: "bar" | "pie" = "bar";

  if (isRatingResponseData(data)) {
    // Process array-based rating data
    chartData = data.map(item => ({
      name: `${item.rating}${item.group ? ` (${item.group})` : ''}`,
      value: item.count
    }));
  } else if (isSatisfactionData(data)) {
    // Process satisfaction data
    chartData = [
      { name: "Unsatisfied", value: data.unsatisfied },
      { name: "Neutral", value: data.neutral },
      { name: "Satisfied", value: data.satisfied }
    ];
    chartType = "pie";
  } else {
    return <div>Invalid data format</div>;
  }

  return (
    <div className="w-full">
      <Chart 
        data={chartData} 
        type={chartType}
        height={300}
        colors={isNps ? ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"] : undefined}
      />
      {isSatisfactionData(data) && (
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            Total Responses: {data.total} | Median: {data.median.toFixed(1)}
          </p>
        </div>
      )}
    </div>
  );
};
