
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

  const { data: supervisorData, isLoading: isLoadingSupervisor } = useSupervisorData(
    campaignId,
    instanceId,
    questionName,
    isNps,
    slideType
  );

  return useMemo(() => {
    if (!data?.responses) return null;

    // For supervisor dimension, use RPC data directly
    if (slideType === 'supervisor') {
      if (isLoadingSupervisor || !supervisorData) return null;
      return supervisorData;
    }

    // Skip processing for text questions
    if (questionType === "text" || questionType === "comment") {
      return null;
    }

    // For NPS questions in comparison view
    if (isNps && slideType !== 'main') {
      const dimensionData = new Map<string, NpsComparisonData>();

      data.responses.forEach((response) => {
        const answer = response.answers[questionName]?.answer;
        if (typeof answer !== 'number') return;

        let dimensionValue = "Unknown";
        switch (slideType) {
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
          dimensionData.set(dimensionValue, {
            dimension: dimensionValue,
            detractors: 0,
            passives: 0,
            promoters: 0,
            total: 0,
            nps_score: 0,
            avg_score: 0
          });
        }

        const group = dimensionData.get(dimensionValue)!;
        group.total += 1;

        // Track sum for average calculation
        if (group.avg_score === 0) {
          group.avg_score = answer;
        } else {
          // Running average calculation
          group.avg_score = ((group.avg_score * (group.total - 1)) + answer) / group.total;
        }

        if (answer <= 6) {
          group.detractors += 1;
        } else if (answer <= 8) {
          group.passives += 1;
        } else {
          group.promoters += 1;
        }

        // Calculate NPS score
        group.nps_score = ((group.promoters - group.detractors) / group.total) * 100;
      });

      return Array.from(dimensionData.values());
    }

    // For main NPS view
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
