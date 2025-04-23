
import pptxgen from "pptxgenjs";
import { CampaignMetadata, PresentationData, ProgressCallback, SurveyQuestion } from "./types";
import { THEME, slideMasters } from "./theme";
import { cleanText, formatDate } from "./utils";
import { addQuestionChart, addComparisonChart } from "./charts";

/**
 * Creates title slide
 */
export const createTitleSlide = (pptx: pptxgen, campaign: CampaignMetadata) => {
  const slide = pptx.addSlide();
  Object.assign(slide, slideMasters.TITLE);

  slide.addText(campaign.name, {
    x: 0.5,
    y: 0.5,
    w: "90%",
    fontSize: 44,
    bold: true,
    color: THEME.text.primary,
  });

  if (campaign.description) {
    slide.addText(campaign.description, {
      x: 0.5,
      y: 2,
      w: "90%",
      fontSize: 20,
      color: THEME.text.secondary,
    });
  }

  const startDate = campaign.instance?.starts_at || campaign.starts_at;
  const endDate = campaign.instance?.ends_at || campaign.ends_at;
  const completionRate = campaign.instance?.completion_rate ?? campaign.completion_rate;

  slide.addText([
    { text: "Period: ", options: { bold: true } },
    { text: `${formatDate(startDate)} - ${formatDate(endDate)}` },
    { text: "\nCompletion Rate: ", options: { bold: true } },
    { text: `${completionRate?.toFixed(1)}%` },
  ], {
    x: 0.5,
    y: 4,
    w: "90%",
    fontSize: 16,
    color: THEME.text.light,
  });
};

/**
 * Creates completion rate slide
 */
export const createCompletionSlide = (pptx: pptxgen, campaign: CampaignMetadata) => {
  const slide = pptx.addSlide();
  Object.assign(slide, slideMasters.CHART);

  slide.addText("Response Distribution", {
    x: 0.5,
    y: 0.5,
    fontSize: 32,
    bold: true,
    color: THEME.text.primary,
  });

  // Calculate instance status distribution
  const instanceCompletionRate = campaign.instance?.completion_rate || 0;
  const expiredRate = 0; // Fallback since the property doesn't exist in the type
  const pendingRate = 100 - (instanceCompletionRate + expiredRate);

  const data = [{
    name: "Status Distribution",
    labels: ["Completed", "Expired", "Pending"],
    values: [instanceCompletionRate, expiredRate, pendingRate]
  }];

  // Make pie chart smaller and position it on the left side
  slide.addChart(pptx.ChartType.pie, data, {
    x: 0.5,  // Position from left
    y: 1.5,  // Position from top
    w: 4.2,  // Reduced width
    h: 3,    // Reduced height
    chartColors: [THEME.primary, THEME.tertiary, THEME.light],
    showLegend: true,
    legendPos: 'r',
    legendFontSize: 11,
    dataLabelFormatCode: '0"%"',
    dataLabelFontSize: 10,
    showValue: true,
  });

  // Add completion stats as text on the right side of the chart
  slide.addText([
    { text: "Response Status\n\n", options: { bold: true, fontSize: 14 } },
    { text: `Completed: `, options: { bold: true } },
    { text: `${instanceCompletionRate.toFixed(1)}%\n` },
    { text: `Expired: `, options: { bold: true } },
    { text: `${expiredRate.toFixed(1)}%\n` },
    { text: `Pending: `, options: { bold: true } },
    { text: `${pendingRate.toFixed(1)}%` },
  ], {
    x: 5.2,  // Position text to the right of the chart
    y: 2,    // Align vertically with the chart
    w: 4,    // Fixed width for text block
    fontSize: 12,
    color: THEME.text.primary,
  });
};

/**
 * Creates question slides with comparisons
 */
export const createQuestionSlides = async (
  pptx: pptxgen, 
  presentationData: PresentationData,
  onProgress?: ProgressCallback
) => {
  // Filter out text and comment questions
  const filteredQuestions = presentationData.questions.filter(
    question => question.type !== "text" && question.type !== "comment"
  );

  for (const question of filteredQuestions) {
    // Main question slide
    const mainSlide = pptx.addSlide();
    Object.assign(mainSlide, slideMasters.CHART);

    mainSlide.addText(cleanText(question.title), {
      x: 0.5,
      y: 0.5,
      w: "90%",
      fontSize: 28,
      bold: true,
      color: THEME.text.primary,
      wrap: true,
    });

    // Add chart based on question type
    addQuestionChart(mainSlide, question, presentationData);

    // Create comparison slides
    for (const dimension of ["sbu", "gender", "location", "employment_type", "level", "employee_type", "employee_role"]) {
      const comparisonSlide = pptx.addSlide();
      Object.assign(comparisonSlide, slideMasters.CHART);

      comparisonSlide.addText(cleanText(question.title), {
        x: 0.5,
        y: 0.5,
        w: "90%",
        fontSize: 24,
        bold: true,
        color: THEME.text.primary,
        wrap: true,
      });

      comparisonSlide.addText(`Response Distribution by ${dimension}`, {
        x: 0.5,
        y: 1.2,
        fontSize: 20,
        color: THEME.text.secondary,
      });

      // Add comparison chart
      addComparisonChart(comparisonSlide, question, presentationData, dimension);
    }
    
    // Call the progress callback after each question's slides are created
    if (onProgress) {
      onProgress(1); // Pass a numeric value to indicate progress increment
    }
  }
};
