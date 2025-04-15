
import pptxgen from "pptxgenjs";
import { CampaignData } from "../types";
import { ProcessedData, Question } from "../types/responses";
import { createTitleSlide, createCompletionSlide, createQuestionSlides } from "./pptx/slides";
import { PPTXExportConfig, DEFAULT_EXPORT_CONFIG } from "../types/exportConfig";
import { getTheme, getSlideMasters, ThemeColors } from "./pptx/theme";
import { ComparisonDimension } from "../types/comparison";
import { addQuestionChart, addComparisonChart } from "./pptx/charts";

type ProgressCallback = (progress: number) => void;

export const exportToPptx = async (
  campaign: CampaignData,
  processedData: ProcessedData,
  config: PPTXExportConfig = DEFAULT_EXPORT_CONFIG,
  onProgress?: ProgressCallback
) => {
  try {
    const pptx = new pptxgen();
    let currentProgress = 0;
    
    // Get the theme based on config
    const theme = getTheme(config.branding.theme);
    const slideMasters = getSlideMasters(config.branding.theme);
    
    // Calculate total steps for progress tracking
    let totalSteps = 0;
    if (config.slides.includeTitleSlide) totalSteps++;
    if (config.slides.includeCompletionSlide) totalSteps++;
    
    // Get questions for slides
    const questions = processedData.questions.filter(question => {
      if (!question) return false;
      if (config.questions.excludeTextQuestions && 
          (question.type === "text" || question.type === "comment")) {
        return false;
      }
      return config.questions.includedQuestionIds === "all" || 
             (Array.isArray(config.questions.includedQuestionIds) && 
              config.questions.includedQuestionIds.includes(question.name));
    });

    totalSteps += questions.length * (1 + config.comparisons.dimensions.length);

    // Set presentation properties
    pptx.author = "Survey System";
    pptx.title = campaign.name;
    
    // Create title slide if configured
    if (config.slides.includeTitleSlide) {
      await createTitleSlide(pptx, campaign, theme, slideMasters);
      currentProgress += 1;
      onProgress?.(Math.round((currentProgress / totalSteps) * 100));
    }

    // Create completion rate slide if configured
    if (config.slides.includeCompletionSlide) {
      await createCompletionSlide(pptx, campaign, theme, slideMasters);
      currentProgress += 1;
      onProgress?.(Math.round((currentProgress / totalSteps) * 100));
    }

    // Create question slides with comparisons
    for (const question of questions) {
      // Create main question slide
      await createQuestionSlide(pptx, campaign, processedData, question, theme, slideMasters);
      currentProgress += 1;
      onProgress?.(Math.round((currentProgress / totalSteps) * 100));

      // Create comparison slides if configured
      for (const dimension of config.comparisons.dimensions) {
        await createComparisonSlide(
          pptx, 
          campaign, 
          processedData,
          question,
          dimension,
          theme,
          slideMasters
        );
        currentProgress += 1;
        onProgress?.(Math.round((currentProgress / totalSteps) * 100));
      }
    }

    // Save the presentation
    const fileName = `${campaign.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_presentation.pptx`;
    await pptx.writeFile({ fileName });

    onProgress?.(100);
    return fileName;
  } catch (error) {
    console.error("Error exporting presentation:", error);
    throw error;
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
