
import { useMemo } from "react";
import { 
  ProcessedData, 
  BooleanResponseData, 
  RatingResponseData, 
  SatisfactionData, 
  ComparisonGroup,
  NpsComparisonGroup,
  SatisfactionComparisonGroup 
} from "../../types/responses";
import { ComparisonDimension } from "../../types/comparison";

type QuestionDataResult = BooleanResponseData | RatingResponseData | NpsComparisonGroup[] | SatisfactionComparisonGroup[] | null;

export function useQuestionData(
  data: ProcessedData | null,
  questionName: string,
  questionType: string,
  comparisonDimension: ComparisonDimension = "main"
): QuestionDataResult {
  return useMemo(() => {
    if (!data) return null;

    // If looking for a comparison (not the main view)
    if (comparisonDimension !== "main" && comparisonDimension !== "none") {
      // Get comparison data for this dimension
      const comparisonData = data.comparisons[questionName]?.[comparisonDimension];
      
      // No data available for this comparison
      if (!comparisonData) return null;
      
      // For rating-type questions, return the comparison data as is
      if (questionType === "rating" && Array.isArray(comparisonData)) {
        return comparisonData;
      }
      
      return comparisonData;
    }

    // Get data for the main question view
    const questionData = data.questionData[questionName];
    if (!questionData) return null;

    // Process based on question type
    if (questionType === "boolean") {
      const choices = questionData.choices || {};
      return {
        yes: choices["yes"] || choices["true"] || 0,
        no: choices["no"] || choices["false"] || 0
      } as BooleanResponseData;
    }

    if (questionType === "rating") {
      const ratings = questionData.ratings || {};
      const avgRating = questionData.avgRating || 0;

      // Convert to array form for RatingResponseData
      const ratingData: RatingResponseData = Object.entries(ratings).map(([rating, count]) => ({
        rating: Number(rating),
        count: count as number
      })).sort((a, b) => a.rating - b.rating);

      return ratingData;
    }

    return null;
  }, [data, questionName, questionType, comparisonDimension]);
}
