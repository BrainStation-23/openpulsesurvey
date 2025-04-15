
import { useMemo } from "react";
import { ProcessedData, BooleanResponseData, RatingResponseData, SatisfactionData, ComparisonGroup } from "../../types/responses";
import { ComparisonDimension } from "../../types/comparison";

type QuestionDataResult = BooleanResponseData | RatingResponseData | SatisfactionData | ComparisonGroup[] | null;

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
      return data.comparisons[questionName]?.[comparisonDimension] || null;
    }

    // Get data for the main question view
    const questionData = data.questionData[questionName];
    if (!questionData) return null;

    // Process based on question type
    if (questionType === "boolean") {
      const choices = questionData.choices || {};
      return {
        yes: choices["yes"] || 0,
        no: choices["no"] || 0
      } as BooleanResponseData;
    }

    if (questionType === "rating") {
      const ratings = questionData.ratings || {};
      const avgRating = questionData.avgRating || 0;

      // Convert to array form for RatingResponseData
      const ratingData: RatingResponseData = Object.entries(ratings).map(([rating, count]) => ({
        rating: Number(rating),
        count: count
      })).sort((a, b) => a.rating - b.rating);

      return ratingData;
    }

    return null;
  }, [data, questionName, questionType, comparisonDimension]);
}
