
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

  // Main title
  slide.addText(campaign.name, {
    x: 0.5,
    y: 2,
    w: "90%",
    fontSize: 36,
    bold: true,
    color: THEME.text.primary,
    align: "center"
  });

  // Instance information if available
  if (campaign.instance) {
    slide.addText(`Period ${campaign.instance.period_number}`, {
      x: 0.5,
      y: 2.8,
      w: "90%",
      fontSize: 24,
      color: THEME.primary,
      align: "center"
    });
  }

  // Description if available
  if (campaign.description) {
    slide.addText(campaign.description, {
      x: 0.5,
      y: 3.5,
      w: "90%",
      fontSize: 18,
      color: THEME.text.secondary,
      align: "center"
    });
  }

  // Date range
  const startDate = campaign.instance?.starts_at || campaign.starts_at;
  const endDate = campaign.instance?.ends_at || campaign.ends_at;

  slide.addText(`${formatDate(startDate)} - ${formatDate(endDate)}`, {
    x: 0.5,
    y: 4.5,
    w: "90%",
    fontSize: 16,
    color: THEME.text.light,
    align: "center"
  });
};

// Create completion rate slide with proper data calculation
export const createCompletionSlide = (pptx: pptxgen, campaign: CampaignData, processedData: ProcessedData) => {
  const slide = pptx.addSlide();
  Object.assign(slide, slideMasters.CHART);

  slide.addText("Response Distribution", {
    x: 0.5,
    y: 0.5,
    fontSize: 32,
    bold: true,
    color: THEME.text.primary,
  });

  // Calculate response statistics from processed data
  const totalResponses = processedData.responses.length;
  const submittedResponses = processedData.responses.filter(r => r.submitted_at).length;
  
  // For demo purposes, let's create a simple distribution
  // In a real scenario, you'd want to get actual assignment status data
  const completedPercentage = totalResponses > 0 ? (submittedResponses / totalResponses) * 100 : 0;
  const pendingPercentage = 100 - completedPercentage;

  const data = [{
    name: "Response Status",
    labels: ["Completed", "Pending"],
    values: [completedPercentage, pendingPercentage]
  }];

  // Add pie chart
  slide.addChart(pptx.ChartType.pie, data, {
    x: 0.5,
    y: 1.5,
    w: 4.2,
    h: 3,
    chartColors: [THEME.primary, THEME.light],
    showLegend: true,
    legendPos: 'r',
    legendFontSize: 11,
    dataLabelFormatCode: '0"%"',
    dataLabelFontSize: 10,
    showValue: true,
  });

  // Add response statistics as text
  slide.addText([
    { text: "Response Summary\n\n", options: { bold: true, fontSize: 14 } },
    { text: `Total Responses: `, options: { bold: true } },
    { text: `${totalResponses}\n` },
    { text: `Submitted: `, options: { bold: true, color: THEME.primary } },
    { text: `${submittedResponses} (${completedPercentage.toFixed(1)}%)\n` },
    { text: `Pending: `, options: { bold: true, color: THEME.light } },
    { text: `${totalResponses - submittedResponses} (${pendingPercentage.toFixed(1)}%)` },
  ], {
    x: 5.2,
    y: 2,
    w: 4,
    fontSize: 12,
    color: THEME.text.primary,
  });
};

// Create question slides
export const createQuestionSlides = async (
  pptx: pptxgen, 
  campaign: CampaignData, 
  processedData: ProcessedData,
  onProgress?: (progress: number) => void
) => {
  // Filter out text and comment questions
  const filteredQuestions = processedData.questions.filter(
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
    await addQuestionChart(mainSlide, question, processedData);

    // Create comparison slides
    for (const dimension of ["sbu", "gender", "location", "employment_type", "level", "employee_type", "employee_role", "generation"]) {
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
    
    // Call the progress callback after each question's slides are created
    if (onProgress) {
      onProgress(1); // Pass a numeric value to indicate progress increment
    }
  }
};
