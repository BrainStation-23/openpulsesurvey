
import pptxgen from "pptxgenjs";
import { CampaignData } from "../../../types";
import { ProcessedData } from "../../../types/responses";
import { createTheme, createSlideMasters } from "../theme";
import { cleanText } from "../helpers";
import { addQuestionChart, addComparisonChart } from "../charts";
import { ExportConfig, DEFAULT_EXPORT_CONFIG } from "../config/exportConfig";

export const createQuestionSlides = async (
  pptx: pptxgen,
  campaign: CampaignData,
  processedData: ProcessedData,
  config: ExportConfig = DEFAULT_EXPORT_CONFIG,
  onProgress?: (progress: number) => void
) => {
  const theme = createTheme(config.theme);
  const slideMasters = createSlideMasters(theme);

  // Filter out text and comment questions
  const filteredQuestions = processedData.questions.filter(
    question => question.type !== "text" && question.type !== "comment"
  );

  // Get enabled dimensions from config
  const enabledDimensions = config.dimensions.filter(dim => dim.enabled);

  for (const question of filteredQuestions) {
    // Create main question slide if enabled
    if (config.includeMainSlides) {
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
        fontFace: config.theme.fontFamily
      });

      // Add chart based on question type with theme
      await addQuestionChart(mainSlide, question, processedData, theme);
    }

    // Create comparison slides for enabled dimensions
    if (config.includeComparisonSlides) {
      for (const dimension of enabledDimensions) {
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
          fontFace: config.theme.fontFamily
        });

        comparisonSlide.addText(`Response Distribution by ${dimension.displayName}`, {
          x: 0.5,
          y: 1.2,
          fontSize: 20,
          color: theme.text.secondary,
          fontFace: config.theme.fontFamily
        });

        // Add comparison chart with theme
        await addComparisonChart(comparisonSlide, question, processedData, dimension.key, theme);
      }
    }
    
    // Call the progress callback after each question's slides are created
    if (onProgress) {
      onProgress(1);
    }
  }
};
