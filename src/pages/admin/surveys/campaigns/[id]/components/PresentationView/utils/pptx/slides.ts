
import pptxgen from "pptxgenjs";
import { CampaignData } from "../../types";
import { ProcessedData } from "../../types/responses";
import { THEME, slideMasters } from "./theme";
import { cleanText, formatDate } from "./helpers";
import { addQuestionChart, addComparisonChart } from "./charts";

// Create title slide
export const createTitleSlide = (pptx: pptxgen, campaign: CampaignData) => {
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

// Create completion rate slide
export const createCompletionSlide = (pptx: pptxgen, campaign: CampaignData) => {
  const slide = pptx.addSlide();
  Object.assign(slide, slideMasters.CHART);

  slide.addText("Campaign Completion", {
    x: 0.5,
    y: 0.5,
    fontSize: 32,
    bold: true,
    color: THEME.text.primary,
  });

  const completionData = [{
    name: "Completion",
    labels: ["Completed", "Pending"] as string[],
    values: [campaign.completion_rate || 0, 100 - (campaign.completion_rate || 0)]
  }];

  slide.addChart(pptx.ChartType.doughnut, completionData, {
    x: 1,
    y: 1.5,
    w: 8,
    h: 5,
    chartColors: [THEME.primary, THEME.light],
    showLegend: true,
    legendPos: 'b',
    dataLabelFormatCode: '0"%"'
  });
};

// Create question slides
export const createQuestionSlides = async (
  pptx: pptxgen, 
  campaign: CampaignData, 
  processedData: ProcessedData
) => {
  const { questions } = processedData;

  for (const question of questions) {
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
    await addQuestionChart(mainSlide, question, processedData);

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
      await addComparisonChart(comparisonSlide, question, processedData, dimension);
    }
  }
};
