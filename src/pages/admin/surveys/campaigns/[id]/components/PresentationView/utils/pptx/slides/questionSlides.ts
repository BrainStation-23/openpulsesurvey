
import pptxgen from "pptxgenjs";
import { CampaignData } from "../../../types";
import { ProcessedData } from "../../../types/responses";
import { createTheme, createSlideMasters, createDecorativeShape } from "../theme";
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

      // Add decorative header accent
      createDecorativeShape(mainSlide, theme, 'header-accent');

      // Enhanced question title with better styling
      mainSlide.addText(cleanText(question.title), {
        x: 0.8,
        y: 0.7,
        w: 8.4,
        fontSize: 32,
        bold: true,
        color: theme.text.primary.replace('#', ''),
        wrap: true,
        fontFace: config.theme.fontFamily,
        shadow: {
          type: 'outer',
          color: '000000',
          blur: 2,
          offset: 1,
          angle: 45,
          opacity: 0.1
        }
      });

      // Add period information if available
      if (campaign.instance) {
        mainSlide.addText(`Period ${campaign.instance.period_number}`, {
          x: 0.8,
          y: 1.4,
          fontSize: 18,
          color: theme.secondary.replace('#', ''),
          fontFace: config.theme.fontFamily,
          italic: true
        });
      }

      // Add chart based on question type
      await addQuestionChart(mainSlide, question, processedData);

      // Add decorative footer line
      createDecorativeShape(mainSlide, theme, 'footer-line');

      // Add subtle background decoration
      mainSlide.addShape(pptx.ShapeType.ellipse, {
        x: 8.5,
        y: 5.5,
        w: 1.5,
        h: 1.5,
        fill: { color: theme.light.replace('#', ''), transparency: 85 }
      });
    }

    // Create comparison slides for enabled dimensions
    if (config.includeComparisonSlides) {
      for (const dimension of enabledDimensions) {
        const comparisonSlide = pptx.addSlide();
        Object.assign(comparisonSlide, slideMasters.CHART);

        // Add decorative header accent
        createDecorativeShape(comparisonSlide, theme, 'header-accent');

        // Enhanced question title
        comparisonSlide.addText(cleanText(question.title), {
          x: 0.8,
          y: 0.7,
          w: 8.4,
          fontSize: 28,
          bold: true,
          color: theme.text.primary.replace('#', ''),
          wrap: true,
          fontFace: config.theme.fontFamily
        });

        // Enhanced comparison subtitle with background
        comparisonSlide.addShape(pptx.ShapeType.rect, {
          x: 0.8,
          y: 1.3,
          w: 8.4,
          h: 0.4,
          fill: { color: theme.primary.replace('#', ''), transparency: 90 }
        });

        comparisonSlide.addText(`Response Distribution by ${dimension.displayName}`, {
          x: 1,
          y: 1.4,
          w: 8,
          fontSize: 22,
          color: theme.text.primary.replace('#', ''),
          fontFace: config.theme.fontFamily,
          bold: true,
          align: 'center'
        });

        // Add comparison chart
        await addComparisonChart(comparisonSlide, question, processedData, dimension.key);

        // Add decorative footer line
        createDecorativeShape(comparisonSlide, theme, 'footer-line');

        // Add period information if available
        if (campaign.instance) {
          comparisonSlide.addText(`Period ${campaign.instance.period_number}`, {
            x: 8,
            y: 6.8,
            fontSize: 14,
            color: theme.text.light.replace('#', ''),
            fontFace: config.theme.fontFamily,
            align: 'right'
          });
        }
      }
    }
    
    // Call the progress callback after each question's slides are created
    if (onProgress) {
      onProgress(1);
    }
  }
};
