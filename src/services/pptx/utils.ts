
import { format } from "date-fns";

/**
 * Cleans text from HTML content for PPTX export
 */
export const cleanText = (text: string): string => {
  return text.replace(/<[^>]*>/g, '');
};

/**
 * Formats dates consistently
 */
export const formatDate = (date: string): string => {
  try {
    return format(new Date(date), "PPP");
  } catch (error) {
    console.error("Error formatting date:", error);
    return date;
  }
};

/**
 * Groups data by dimension for comparison charts
 */
export function groupDataByDimension(responses: any[], question: any, dimension: string) {
  const groupedData = new Map();

  // Group responses by dimension
  responses.forEach((response) => {
    const answer = response.answers[question.name]?.answer;
    if (answer === undefined) return;

    let groupKey = "Unknown";
    switch (dimension) {
      case "sbu":
        groupKey = response.respondent.sbu?.name || "Unknown";
        break;
      case "gender":
        groupKey = response.respondent.gender || "Unknown";
        break;
      case "location":
        groupKey = response.respondent.location?.name || "Unknown";
        break;
      case "employment_type":
        groupKey = response.respondent.employment_type?.name || "Unknown";
        break;
      case "level":
        groupKey = response.respondent.level?.name || "Unknown";
        break;
      case "employee_type":
        groupKey = response.respondent.employee_type?.name || "Unknown";
        break;
      case "employee_role":
        groupKey = response.respondent.employee_role?.name || "Unknown";
        break;
    }

    if (!groupedData.has(groupKey)) {
      groupedData.set(groupKey, []);
    }
    groupedData.get(groupKey).push(answer);
  });

  return groupedData;
}

/**
 * Calculate the median of an array of numbers
 */
export const calculateMedian = (ratings: number[]): number => {
  if (ratings.length === 0) return 0;
  const sorted = [...ratings].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
};

/**
 * Process NPS (Net Promoter Score) data
 */
export const processNpsData = (validAnswers: number[]) => {
  const total = validAnswers.length;
  const detractors = validAnswers.filter(r => r <= 6).length;
  const passives = validAnswers.filter(r => r > 6 && r <= 8).length;
  const promoters = validAnswers.filter(r => r > 8).length;

  const npsScore = Math.round(
    ((promoters - detractors) / total) * 100
  );

  return {
    detractors,
    passives,
    promoters,
    total,
    npsScore
  };
};

/**
 * Process satisfaction rating data
 */
export const processSatisfactionData = (validAnswers: number[]) => {
  const total = validAnswers.length;
  const unsatisfied = validAnswers.filter(r => r <= 2).length;
  const neutral = validAnswers.filter(r => r === 3).length;
  const satisfied = validAnswers.filter(r => r >= 4).length;

  const satisfactionRate = Math.round((satisfied / total) * 100);

  return {
    unsatisfied,
    neutral,
    satisfied,
    total,
    satisfactionRate
  };
};
