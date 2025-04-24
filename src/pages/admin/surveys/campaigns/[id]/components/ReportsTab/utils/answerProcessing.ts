
/**
 * Utility functions for processing question answers in the Reports Tab
 */

import { ProcessedResponse } from "../hooks/useResponseProcessing";

/**
 * Calculate the median value of an array of numbers
 */
export const calculateMedian = (ratings: number[]) => {
  const sorted = [...ratings].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
};

/**
 * Process question answers based on question type
 */
export const processAnswersForQuestion = (
  questionName: string,
  type: string,
  question: any,
  responses: ProcessedResponse[]
) => {
  const answers = responses.map(
    (response) => response.answers[questionName]?.answer
  );

  switch (type) {
    case "boolean":
      return {
        yes: answers.filter((a) => a === true).length,
        no: answers.filter((a) => a === false).length,
      };

    case "rating":
    case "nps": {
      const isNps = question.rateCount === 10;
      
      if (isNps) {
        const validRatings = answers.filter(
          (rating) => typeof rating === "number" && rating >= 0 && rating <= 10
        ) as number[];
        
        const detractors = validRatings.filter((r) => r <= 6).length;
        const passives = validRatings.filter((r) => r >= 7 && r <= 8).length;
        const promoters = validRatings.filter((r) => r >= 9).length;
        const total = validRatings.length;

        let avgScore;
        if (total > 0) {
          avgScore = Number((validRatings.reduce((sum, r) => sum + r, 0) / total).toFixed(1));
        }
        
        const npsScore = total > 0 
          ? ((promoters - detractors) / total) * 100 
          : 0;
        
        return {
          detractors,
          passives,
          promoters,
          total,
          nps_score: npsScore,
          avg_score: avgScore
        };
      } else {
        const validAnswers = answers.filter(
          (rating) => typeof rating === "number" && rating >= 1 && rating <= 5
        );
        
        return {
          unsatisfied: validAnswers.filter((r) => r <= 2).length,
          neutral: validAnswers.filter((r) => r === 3).length,
          satisfied: validAnswers.filter((r) => r >= 4).length,
          total: validAnswers.length,
          median: calculateMedian(validAnswers)
        };
      }
    }

    case "text":
    case "comment": {
      const wordFrequency: Record<string, number> = {};
      answers.forEach((answer) => {
        if (typeof answer === "string") {
          const words = answer
            .toLowerCase()
            .replace(/[^\w\s]/g, "")
            .split(/\s+/)
            .filter((word) => word.length > 2);

          words.forEach((word) => {
            wordFrequency[word] = (wordFrequency[word] || 0) + 1;
          });
        }
      });

      return Object.entries(wordFrequency)
        .map(([text, value]) => ({ text, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 50);
    }

    default:
      throw new Error(`Unsupported question type: ${type}`);
  }
};
