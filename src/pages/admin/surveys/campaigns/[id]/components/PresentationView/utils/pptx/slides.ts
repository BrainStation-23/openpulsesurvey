
import pptxgen from "pptxgenjs";
import { CampaignData } from "../../types";
import { ProcessedData, Question } from "../../types/responses";
import { ThemeColors, getSlideMasters } from "./theme";
import { cleanText, formatDate } from "./helpers";
import { addQuestionChart, addComparisonChart } from "./charts";
import { ComparisonDimension } from "../../types/exportConfig";

// Create title slide
export const createTitleSlide = async (
  pptx: pptxgen, 
  campaign: CampaignData, 
  theme: ThemeColors,
  slideMasters: any
) => {
  const slide = pptx.addSlide();
  Object.assign(slide, slideMasters.TITLE);

  slide.addText(campaign.name, {
    x: 0.5,
    y: 0.5,
    w: "90%",
    fontSize: 44,
    bold: true,
    color: theme.text.primary,
  });

  if (campaign.description) {
    slide.addText(campaign.description, {
      x: 0.5,
      y: 2,
      w: "90%",
      fontSize: 20,
      color: theme.text.secondary,
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
    color: theme.text.light,
  });
};

// Create completion rate slide
export const createCompletionSlide = async (
  pptx: pptxgen, 
  campaign: CampaignData,
  theme: ThemeColors,
  slideMasters: any
) => {
  const slide = pptx.addSlide();
  Object.assign(slide, slideMasters.CHART);

  slide.addText("Response Distribution", {
    x: 0.5,
    y: 0.5,
    fontSize: 32,
    bold: true,
    color: theme.text.primary,
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
    w: 4.2,  // Reduced width (60% smaller)
    h: 3,    // Reduced height (60% smaller)
    chartColors: [theme.primary, theme.tertiary, theme.light],
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
    color: theme.text.primary,
  });
};

// Create question slides
export const createQuestionSlides = async (
  pptx: pptxgen, 
  campaign: CampaignData, 
  processedData: ProcessedData,
  theme: ThemeColors,
  slideMasters: any,
  options: {
    excludeTextQuestions: boolean;
    includedQuestionIds: string[] | "all";
    comparisonDimensions: ComparisonDimension[];
  },
  onProgress?: (progress: number) => void
) => {
  // Filter questions based on configuration
  const filteredQuestions = processedData.questions.filter(question => {
    // Filter out text and comment questions if configured
    if (options.excludeTextQuestions && (question.type === "text" || question.type === "comment")) {
      return false;
    }
    
    // Filter based on includedQuestionIds
    return options.includedQuestionIds === "all" || 
           (Array.isArray(options.includedQuestionIds) && 
            options.includedQuestionIds.includes(question.id));
  });

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
      color: theme.text.primary,
      wrap: true,
    });

    // Add chart based on question type
    await addQuestionChart(mainSlide, question, processedData, theme);
    onProgress?.(1);

    // Create comparison slides based on selected dimensions
    for (const dimension of options.comparisonDimensions) {
      const comparisonSlide = pptx.addSlide();
      Object.assign(comparisonSlide, slideMasters.CHART);

      comparisonSlide.addText(cleanText(question.title), {
        x: 0.5,
        y: 0.5,
        w: "90%",
        fontSize: 24,
        bold: true,
        color: theme.text.primary,
        wrap: true,
      });

      comparisonSlide.addText(`Response Distribution by ${dimension.replace(/_/g, ' ')}`, {
        x: 0.5,
        y: 1.2,
        fontSize: 20,
        color: theme.text.secondary,
      });

      // Add comparison chart
      await addComparisonChart(comparisonSlide, question, processedData, dimension, theme);
      onProgress?.(1);
    }
  }
};
