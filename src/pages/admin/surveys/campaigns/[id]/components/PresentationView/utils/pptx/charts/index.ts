
import pptxgen from "pptxgenjs";
import { ProcessedData } from "../../../types/responses";
import { addBooleanChart, addBooleanComparison } from "./booleanCharts";
import { addRatingChart, addRatingComparison } from "./ratingCharts";

// Helper to add appropriate chart for question type
export const addQuestionChart = async (
  slide: pptxgen.Slide,
  question: any,
  processedData: ProcessedData
) => {
  const answers = processedData.responses
    .filter(r => r.answers[question.name]?.answer !== undefined)
    .map(r => r.answers[question.name].answer);

  switch (question.type) {
    case "boolean":
      addBooleanChart(slide, answers);
      break;
    case "rating":
      addRatingChart(slide, answers, question.rateCount === 10);
      break;
  }
};

// Helper to add comparison chart
export const addComparisonChart = async (
  slide: pptxgen.Slide,
  question: any,
  processedData: ProcessedData,
  dimension: string
) => {
  const groupedData = new Map();

  // Group responses by dimension
  processedData.responses.forEach((response) => {
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

  switch (question.type) {
    case "boolean":
      addBooleanComparison(slide, groupedData, dimension);
      break;
    case "rating":
      addRatingComparison(slide, groupedData, dimension, question.rateCount === 10);
      break;
  }
};
