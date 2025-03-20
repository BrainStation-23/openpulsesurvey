
import jsPDF from 'jspdf';
import { Question, ProcessedData } from "../../../types/responses";
import { addBooleanChart } from './booleanCharts';
import { addRatingChart } from './ratingCharts';
import { addTextChart } from './textCharts';
import { addComparisonChart } from './comparisonCharts';

export async function addQuestionChart(
  pdf: jsPDF,
  question: Question,
  processedData: ProcessedData
) {
  const responses = processedData.responses
    .filter(r => r.answers[question.name]?.answer !== undefined)
    .map(r => r.answers[question.name].answer);

  switch (question.type) {
    case "boolean":
      addBooleanChart(pdf, responses);
      break;
    case "rating":
      addRatingChart(pdf, responses, question.rateCount === 10);
      break;
    case "text":
    case "comment":
      addTextChart(pdf, responses);
      break;
  }
}

export { addComparisonChart };
