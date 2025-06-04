
import pptxgen from "pptxgenjs";
import { ProcessedData } from "../../../types/responses";
import { addBooleanChart, addBooleanComparison } from "./booleanCharts";
import { addRatingChart, addRatingComparison } from "./ratingCharts";
import { getGroupedResponses } from "../utils/dataProcessors";

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
  const groupedData = getGroupedResponses(processedData, question.name, dimension);

  switch (question.type) {
    case "boolean":
      addBooleanComparison(slide, groupedData, dimension);
      break;
    case "rating":
      addRatingComparison(slide, groupedData, dimension, question.rateCount === 10);
      break;
  }
};
