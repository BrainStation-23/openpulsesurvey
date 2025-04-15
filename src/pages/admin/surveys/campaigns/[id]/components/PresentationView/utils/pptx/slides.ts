import { CampaignData } from "../../types";
import { ProcessedData, Question } from "../../types/responses";
import { ThemeColors } from "./theme";
import { addQuestionChart, addComparisonChart } from "./charts";
import { ComparisonDimension } from "../../types/comparison";

// Create title slide
export const createTitleSlide = async (pptx: any, campaign: CampaignData, theme: ThemeColors, slideMasters: any) => {
  const slide = pptx.addSlide({ masterName: "TITLE" });

  // Title
  slide.addText(campaign.name, {
    x: 0.5,
    y: 2,
    w: 9,
    h: 1.5,
    fontSize: 36,
    bold: true,
    color: theme.primary,
    align: "center",
  });

  // Subtitle
  slide.addText(campaign.description || "No description provided", {
    x: 0.5,
    y: 3.5,
    w: 9,
    h: 1,
    fontSize: 18,
    color: theme.text.secondary,
    align: "center",
  });

  // Footer
  slide.addText(`Campaign started on ${new Date(campaign.starts_at).toLocaleDateString()}`, {
    x: 0.5,
    y: 6,
    w: 9,
    h: 0.5,
    fontSize: 12,
    color: theme.text.light,
    align: "center",
  });

  return slide;
};

// Create completion rate slide
export const createCompletionSlide = async (pptx: any, campaign: CampaignData, theme: ThemeColors, slideMasters: any) => {
  const slide = pptx.addSlide({ masterName: "SECTION" });

  // Title
  slide.addText("Completion Rate", {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 1,
    fontSize: 28,
    bold: true,
    color: "#FFFFFF",
    align: "center",
  });

  // Completion Rate Value
  slide.addText(`${campaign.completion_rate.toFixed(1)}%`, {
    x: 0.5,
    y: 3,
    w: 9,
    h: 1.5,
    fontSize: 48,
    bold: true,
    color: "#FFFFFF",
    align: "center",
  });

  // Subtitle
  slide.addText("of invited users completed the survey", {
    x: 0.5,
    y: 4.5,
    w: 9,
    h: 1,
    fontSize: 18,
    color: "#FFFFFF",
    align: "center",
  });

  return slide;
};

// Create slides for each question with visualizations
export const createQuestionSlides = async (
  pptx: any,
  campaign: CampaignData,
  processedData: ProcessedData,
  theme: ThemeColors,
  slideMasters: any,
  options: {
    excludeTextQuestions: boolean;
    includedQuestionIds: string[] | "all";
    comparisonDimensions: ComparisonDimension[];
  },
  onProgress?: () => void
) => {
  // Filter questions based on options
  const filteredQuestions = processedData.questions.filter(question => {
    // Skip text questions if configured
    if (options.excludeTextQuestions && (question.type === "text" || question.type === "comment")) {
      return false;
    }
    
    // Include only specific questions if requested
    if (options.includedQuestionIds !== "all" && Array.isArray(options.includedQuestionIds)) {
      return options.includedQuestionIds.includes(question.name);
    }
    
    return true;
  });
  
  // Create slides for each question
  for (const question of filteredQuestions) {
    // Create the main question slide
    await createQuestionSlide(pptx, campaign, processedData, question, theme, slideMasters);
    onProgress?.();
    
    // Create comparison slides if configured
    for (const dimension of options.comparisonDimensions) {
      await createComparisonSlide(pptx, campaign, processedData, question, dimension, theme, slideMasters);
      onProgress?.();
    }
  }
};

// Create a single question slide
const createQuestionSlide = async (
  pptx: any,
  campaign: CampaignData,
  processedData: ProcessedData,
  question: Question,
  theme: ThemeColors,
  slideMasters: any
) => {
  const slide = pptx.addSlide({ masterName: "CHART" });
  
  // Add slide number
  slide.slideNumber = { x: 0.5, y: "90%", color: theme.text.secondary, fontFace: "Arial" };
  
  // Add question title
  slide.addText(question.title, {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.5,
    fontSize: 18,
    bold: true,
    color: theme.text.primary,
  });
  
  // Add chart for the question
  await addQuestionChart(slide, question, processedData, theme);
  
  return slide;
};

// Create a comparison slide for a question
const createComparisonSlide = async (
  pptx: any,
  campaign: CampaignData,
  processedData: ProcessedData,
  question: Question,
  dimension: ComparisonDimension,
  theme: ThemeColors,
  slideMasters: any
) => {
  const slide = pptx.addSlide({ masterName: "CHART" });
  
  // Add slide number
  slide.slideNumber = { x: 0.5, y: "90%", color: theme.text.secondary, fontFace: "Arial" };
  
  // Get a friendly name for the dimension
  const dimensionName = dimension.replace(/_/g, ' ');
  
  // Add slide title
  slide.addText(`${question.title} by ${dimensionName}`, {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.5,
    fontSize: 18,
    bold: true,
    color: theme.text.primary,
  });
  
  // Add comparison chart
  await addComparisonChart(slide, question, processedData, dimension, theme);
  
  return slide;
};
