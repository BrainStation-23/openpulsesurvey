
import { useMemo } from "react";
import { ProcessedData } from "../../types/responses";
import { ComparisonDimension } from "../../types/comparison";
import { useDimensionData } from "../../hooks/useDimensionData";
import { NpsData, NpsComparisonData } from "../../../ReportsTab/types/nps";
import { BooleanResponseData } from "../../types/responses";

// Define the data types from RPC functions
interface SupervisorSatisfactionData {
  dimension: string;
  unsatisfied: number;
  neutral: number;
  satisfied: number;
  total: number;
  avg_score: number;
}

interface BooleanComparisonData {
  dimension: string;
  yes_count: number;
  no_count: number;
  total_count: number;
}

// Update ProcessedResult to include all possible return types
type ProcessedResult = 
  | NpsComparisonData[] 
  | SupervisorSatisfactionData[] 
  | BooleanComparisonData[]
  | NpsData 
  | BooleanResponseData 
  | null;

export function useQuestionData(
  data: ProcessedData | undefined | null,
  questionName: string,
  questionType: string,
  slideType: ComparisonDimension,
  campaignId?: string,
  instanceId?: string
): ProcessedResult {
  const question = data?.questions.find(q => q.name === questionName);
  const isNps = question?.type === 'rating' && question?.rateCount === 10;
  const isBoolean = question?.type === 'boolean';

  // Only call useDimensionData if slideType is a valid dimension
  const { data: dimensionData, isLoading: isLoadingDimension } = useDimensionData(
    campaignId,
    instanceId,
    questionName,
    isNps,
    isBoolean,
    slideType !== 'main' && slideType !== 'none' ? slideType : 'supervisor'
  );

  return useMemo(() => {
    if (!data?.responses) return null;

    // For dimension comparison views (except 'main' and 'none'), use RPC data directly
    if (slideType !== 'main' && slideType !== 'none') {
      if (isLoadingDimension || !dimensionData) return null;
      return dimensionData;
    }

    // Skip processing for text questions
    if (questionType === "text" || questionType === "comment") {
      return null;
    }

    // For boolean questions in main view
    if (questionType === "boolean") {
      const answers = data.responses
        .map(response => response.answers[questionName]?.answer)
        .filter(answer => typeof answer === 'boolean');

      const yes = answers.filter(a => a === true).length;
      const no = answers.filter(a => a === false).length;

      return {
        yes,
        no
      };
    }

    // For NPS questions in main view
    if (isNps && slideType === 'main') {
      const npsData: NpsData = {
        detractors: 0,
        passives: 0,
        promoters: 0,
        total: 0,
        nps_score: 0,
        avg_score: undefined
      };

      let sumRatings = 0;
      let validRatingCount = 0;

      data.responses.forEach((response) => {
        const answer = response.answers[questionName]?.answer;
        if (typeof answer !== 'number') return;

        npsData.total += 1;
        sumRatings += answer;
        validRatingCount += 1;

        if (answer <= 6) {
          npsData.detractors += 1;
        } else if (answer <= 8) {
          npsData.passives += 1;
        } else {
          npsData.promoters += 1;
        }
      });

      if (npsData.total > 0) {
        npsData.nps_score = ((npsData.promoters - npsData.detractors) / npsData.total) * 100;
        if (validRatingCount > 0) {
          npsData.avg_score = Number((sumRatings / validRatingCount).toFixed(1));
        }
      }

      return npsData;
    }

    // For satisfaction questions (rating questions that are not NPS)
    if (questionType === "rating" && !isNps && slideType === 'main') {
      const answers = data.responses
        .map(response => response.answers[questionName]?.answer)
        .filter(answer => typeof answer === 'number') as number[];
      
      const total = answers.length;
      
      if (total === 0) return null;
      
      // Calculate rating distribution
      const unsatisfied = answers.filter(rating => rating <= 2).length;
      const neutral = answers.filter(rating => rating === 3).length;
      const satisfied = answers.filter(rating => rating >= 4).length;
      
      // Calculate median
      const sortedAnswers = [...answers].sort((a, b) => a - b);
      const middle = Math.floor(sortedAnswers.length / 2);
      const median = sortedAnswers.length % 2 === 0
        ? (sortedAnswers[middle - 1] + sortedAnswers[middle]) / 2
        : sortedAnswers[middle];
      
      return {
        unsatisfied,
        neutral,
        satisfied,
        total,
        median
      };
    }

    // Return null for other question types
    return null;
  }, [data, questionName, questionType, slideType, dimensionData, isLoadingDimension, isNps]);
}
