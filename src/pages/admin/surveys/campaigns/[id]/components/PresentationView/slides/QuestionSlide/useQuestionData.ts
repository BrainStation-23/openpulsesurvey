import { useMemo } from "react";
import { 
  ProcessedData, 
  BooleanResponseData, 
  RatingResponseData, 
  SatisfactionData,
  Question
} from "../../types/responses";
import { ComparisonDimension } from "../../types/comparison";
import { 
  processNpsData, 
  processSatisfactionData 
} from "../../../ReportsTab/hooks/useRatingProcessing";

type ProcessedResult = BooleanResponseData | RatingResponseData | SatisfactionData | any[];

export function useQuestionData(
  data: ProcessedData | undefined | null,
  questionName: string,
  questionType: string,
  slideType: ComparisonDimension
): ProcessedResult | null {
  return useMemo(() => {
    if (!data?.responses) return null;

    // Skip processing for text questions entirely
    if (questionType === "text" || questionType === "comment") {
      return null;
    }

    const responses = data.responses;
    const question = data.questions.find(q => q.name === questionName);
    
    if (!question) return null;
    
    // Use the rateCount property to determine if it's an NPS question
    const isNps = question.rateCount === 10 || question.mode === 'nps';

    if (slideType === 'main') {
      switch (questionType) {
        case "boolean": {
          const answers = responses
            .filter(r => r.answers[questionName]?.answer !== undefined)
            .map(r => r.answers[questionName].answer);
          
          const result: BooleanResponseData = {
            yes: answers.filter((a) => a === true).length,
            no: answers.filter((a) => a === false).length,
          };
          return result;
        }

        case "rating": {
          const answers = responses
            .filter(r => typeof r.answers[questionName]?.answer === 'number')
            .map(r => r.answers[questionName].answer);
          
          if (isNps) {
            const ratingCounts: RatingResponseData = new Array(11).fill(0).map((_, rating) => ({
              rating,
              count: answers.filter(a => a === rating).length
            }));
            return ratingCounts;
          } else {
            return processSatisfactionData(answers);
          }
        }

        default:
          return null;
      }
    } else {
      return processComparisonData(responses, questionName, slideType, isNps);
    }
  }, [data, questionName, questionType, slideType]);
}

function processComparisonData(
  responses: ProcessedData["responses"],
  questionName: string,
  dimension: ComparisonDimension,
  isNps: boolean
) {
  const dimensionData = new Map<string, number[]>();

  responses.forEach((response) => {
    const answer = response.answers[questionName]?.answer;
    if (typeof answer !== 'number') return;

    let dimensionValue = "Unknown";
    switch (dimension) {
      case "sbu":
        dimensionValue = response.respondent.sbu?.name || "Unknown";
        break;
      case "gender":
        dimensionValue = response.respondent.gender || "Unknown";
        break;
      case "location":
        dimensionValue = response.respondent.location?.name || "Unknown";
        break;
      case "employment_type":
        dimensionValue = response.respondent.employment_type?.name || "Unknown";
        break;
      case "level":
        dimensionValue = response.respondent.level?.name || "Unknown";
        break;
      case "employee_type":
        dimensionValue = response.respondent.employee_type?.name || "Unknown";
        break;
      case "employee_role":
        dimensionValue = response.respondent.employee_role?.name || "Unknown";
        break;
    }

    if (!dimensionData.has(dimensionValue)) {
      dimensionData.set(dimensionValue, []);
    }

    dimensionData.get(dimensionValue)!.push(answer);
  });

  if (isNps) {
    return Array.from(dimensionData.entries()).map(([dimension, answers]) => {
      const npsData = processNpsData(answers);
      return {
        dimension,
        ...npsData
      };
    });
  } else {
    return Array.from(dimensionData.entries()).map(([dimension, answers]) => {
      const satisfactionData = processSatisfactionData(answers);
      return {
        dimension,
        ...satisfactionData
      };
    });
  }
}
