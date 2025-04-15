
import { useMemo } from "react";
import { 
  ProcessedData, 
  BooleanResponseData, 
  RatingResponseData, 
  SatisfactionData, 
  NpsData,
  ComparisonGroup,
  NpsComparisonGroup,
  SatisfactionComparisonGroup 
} from "../../types/responses";
import { ComparisonDimension } from "../../types/comparison";

type QuestionDataResult = BooleanResponseData | RatingResponseData | SatisfactionData | NpsData | NpsComparisonGroup[] | SatisfactionComparisonGroup[] | null;

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
      const question = data.questions.find(q => q.name === questionName);
      const isNps = question?.rateCount === 10; // Check if this is NPS (0-10 scale)
      const ratings = questionData.ratings || {};
      
      if (isNps) {
        // Process as NPS data (0-10 scale)
        // Convert ratings object to total counts
        const validRatings = Object.entries(ratings).map(([rating, count]) => ({
          rating: Number(rating),
          count: count as number
        }));
        
        const detractors = validRatings.filter(r => r.rating <= 6).reduce((sum, r) => sum + r.count, 0);
        const passives = validRatings.filter(r => r.rating > 6 && r.rating <= 8).reduce((sum, r) => sum + r.count, 0);
        const promoters = validRatings.filter(r => r.rating > 8).reduce((sum, r) => sum + r.count, 0);
        const total = detractors + passives + promoters;
        
        return {
          detractors,
          passives,
          promoters,
          total,
          npsScore: total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0
        } as NpsData;
      } else {
        // Process as satisfaction data (1-5 scale)
        // Check if we have rating data in format that needs aggregation
        if (Object.keys(ratings).length > 0) {
          const validRatings = Object.entries(ratings).map(([rating, count]) => ({
            rating: Number(rating),
            count: count as number
          }));
          
          const unsatisfied = validRatings.filter(r => r.rating <= 2).reduce((sum, r) => sum + r.count, 0);
          const neutral = validRatings.filter(r => r.rating === 3).reduce((sum, r) => sum + r.count, 0);
          const satisfied = validRatings.filter(r => r.rating >= 4).reduce((sum, r) => sum + r.count, 0);
          const total = unsatisfied + neutral + satisfied;
          
          // Calculate median from raw ratings
          const allRatings: number[] = [];
          validRatings.forEach(r => {
            for (let i = 0; i < r.count; i++) {
              allRatings.push(r.rating);
            }
          });
          
          const sortedRatings = [...allRatings].sort((a, b) => a - b);
          const median = sortedRatings.length > 0 ? 
            sortedRatings[Math.floor(sortedRatings.length / 2)] : 0;
          
          return {
            unsatisfied,
            neutral,
            satisfied,
            total,
            median
          } as SatisfactionData;
        }
        
        // Return array of rating data
        return Object.entries(ratings).map(([rating, count]) => ({
          rating: Number(rating),
          count: count as number
        })).sort((a, b) => a.rating - b.rating) as RatingResponseData;
      }
    }

    return null;
  }, [data, questionName, questionType, comparisonDimension]);
}
