
import React from "react";
import { RatingResponseData, SatisfactionData, NpsData } from "../../types/responses";
import { NpsRatingView } from "./ratings/NpsRatingView";
import { SatisfactionRatingView } from "./ratings/SatisfactionRatingView";
import { NumericRatingView } from "./ratings/NumericRatingView";

interface RatingQuestionViewProps {
  data: RatingResponseData | SatisfactionData | NpsData;
  isNps?: boolean;
}

export const RatingQuestionView: React.FC<RatingQuestionViewProps> = ({ data, isNps = false }) => {
  // Helper to determine data types
  const isRatingResponseData = (data: any): data is RatingResponseData => {
    return Array.isArray(data);
  };

  const isSatisfactionData = (data: any): data is SatisfactionData => {
    return !Array.isArray(data) && 'unsatisfied' in data && 'satisfied' in data;
  };

  const isNpsData = (data: any): data is NpsData => {
    return !Array.isArray(data) && 'detractors' in data && 'promoters' in data;
  };

  if (!data) return <div className="text-center text-muted-foreground">No data available</div>;

  if (isNpsData(data)) {
    return <NpsRatingView data={data} />;
  }
  
  if (isSatisfactionData(data)) {
    return <SatisfactionRatingView data={data} />;
  }

  if (isRatingResponseData(data)) {
    return <NumericRatingView data={data} isNps={isNps} />;
  }

  return <div className="text-center text-muted-foreground">Invalid data format for rating visualization</div>;
};
