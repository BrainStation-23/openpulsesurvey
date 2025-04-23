
import pptxgen from "pptxgenjs";
import { groupDataByDimension } from "../utils";
import { PresentationData, SurveyQuestion } from "../types";
import { addBooleanChart, addBooleanComparison } from "./booleanCharts";
import { addRatingChart, addRatingComparison } from "./ratingCharts";

/**
 * Adds appropriate chart for question type
 */
export const addQuestionChart = (
  slide: pptxgen.Slide,
  question: SurveyQuestion,
  presentationData: PresentationData
) => {
  const answers = presentationData.responses
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

/**
 * Adds comparison chart
 */
export const addComparisonChart = (
  slide: pptxgen.Slide,
  question: SurveyQuestion,
  presentationData: PresentationData,
  dimension: string
) => {
  const groupedData = groupDataByDimension(
    presentationData.responses, 
    question, 
    dimension
  );

  switch (question.type) {
    case "boolean":
      addBooleanComparison(slide, groupedData, dimension);
      break;
    case "rating":
      addRatingComparison(slide, groupedData, dimension, question.rateCount === 10);
      break;
  }
};
