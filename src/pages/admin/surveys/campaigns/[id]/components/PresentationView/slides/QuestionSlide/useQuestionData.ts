
import { useMemo } from "react";
import { ProcessedData } from "../../types/responses";
import { ComparisonDimension } from "../../types/comparison";
import { useSupervisorData } from "../../hooks/useSupervisorData";
import { NpsData, NpsComparisonData } from "../../../ReportsTab/types/nps";

type ProcessedResult = NpsComparisonData[] | NpsData | any[];

export function useQuestionData(
  data: ProcessedData | undefined | null,
  questionName: string,
  questionType: string,
  slideType: ComparisonDimension,
  campaignId?: string,
  instanceId?: string
): ProcessedResult | null {
  const question = data?.questions.find(q => q.name === questionName);
  const isNps = question?.type === 'rating' && question?.rateCount === 10;

  // Only call useSupervisorData if slideType is a valid dimension (not 'none' or 'main')
  const { data: supervisorData, isLoading: isLoadingSupervisor } = useSupervisorData(
    campaignId,
    instanceId,
    questionName,
    isNps,
    slideType !== 'main' && slideType !== 'none' ? slideType : 'supervisor'
  );

  return useMemo(() => {
    if (!data?.responses) return null;

    // For dimension comparison views (except 'main' and 'none'), use RPC data directly
    if (slideType !== 'main' && slideType !== 'none') {
      if (isLoadingSupervisor || !supervisorData) return null;
      return supervisorData;
    }

    // Skip processing for text questions
    if (questionType === "text" || questionType === "comment") {
      return null;
    }

    // For NPS questions in main view
    if (isNps && slideType === 'main') {
      const npsData: NpsData = {
        detractors: 0,
        passives: 0,
        promoters: 0,
        total: 0,
        nps_score: 0,
        avg_score: 0
      };

      let sumRatings = 0;

      data.responses.forEach((response) => {
        const answer = response.answers[questionName]?.answer;
        if (typeof answer !== 'number') return;

        npsData.total += 1;
        sumRatings += answer;

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
        npsData.avg_score = sumRatings / npsData.total;
      }

      return npsData;
    }

    // Return null for non-NPS questions (they will be handled by their respective components)
    return null;
  }, [data, questionName, questionType, slideType, supervisorData, isLoadingSupervisor, isNps]);
}
