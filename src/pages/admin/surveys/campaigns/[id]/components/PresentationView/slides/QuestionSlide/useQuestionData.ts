import { useMemo } from "react";
import { ProcessedData } from "../../types/responses";
import { ComparisonDimension } from "../../../../ReportsTab/types/comparison";

export function useQuestionData(
  data: ProcessedData | undefined,
  questionName: string,
  questionType: string,
  slideType: 'main' | ComparisonDimension
) {
  return useMemo(() => {
    if (!data?.responses) return null;

    const responses = data.responses;
    const question = data.questions.find(q => q.name === questionName);
    const isNps = question?.type === 'rating' && question?.rateCount === 10;

    if (slideType === 'main') {
      switch (questionType) {
        case "boolean": {
          const answers = responses
            .filter(r => r.answers[questionName]?.answer !== undefined)
            .map(r => r.answers[questionName].answer);
          
          return {
            yes: answers.filter((a) => a === true).length,
            no: answers.filter((a) => a === false).length,
          };
        }

        case "rating": {
          const answers = responses
            .filter(r => typeof r.answers[questionName]?.answer === 'number')
            .map(r => r.answers[questionName].answer);
          
          if (isNps) {
            return new Array(11).fill(0).map((_, rating) => ({
              rating,
              count: answers.filter(a => a === rating).length
            }));
          } else {
            const validAnswers = answers.filter(
              (rating) => typeof rating === "number" && rating >= 1 && rating <= 5
            );
            
            const calculateMedian = (ratings: number[]) => {
              const sorted = [...ratings].sort((a, b) => a - b);
              const middle = Math.floor(sorted.length / 2);
              
              if (sorted.length % 2 === 0) {
                return (sorted[middle - 1] + sorted[middle]) / 2;
              }
              return sorted[middle];
            };

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
          responses.forEach((response) => {
            const answer = response.answers[questionName]?.answer;
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
  const dimensionData = new Map();

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
    }

    if (!dimensionData.has(dimensionValue)) {
      dimensionData.set(dimensionValue, isNps ? {
        dimension: dimensionValue,
        detractors: 0,
        passives: 0,
        promoters: 0,
        total: 0
      } : {
        dimension: dimensionValue,
        unsatisfied: 0,
        neutral: 0,
        satisfied: 0,
        total: 0
      });
    }

    const group = dimensionData.get(dimensionValue);
    group.total += 1;

    if (isNps) {
      if (answer <= 6) {
        group.detractors += 1;
      } else if (answer <= 8) {
        group.passives += 1;
      } else {
        group.promoters += 1;
      }
    } else {
      if (answer <= 2) {
        group.unsatisfied += 1;
      } else if (answer === 3) {
        group.neutral += 1;
      } else {
        group.satisfied += 1;
      }
    }
  });

  return Array.from(dimensionData.values());
}