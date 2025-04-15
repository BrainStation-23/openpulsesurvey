
import pptxgen from "pptxgenjs";
import { CampaignData } from "../types";
import { ProcessedData } from "../types/responses";
import { createTitleSlide, createCompletionSlide, createQuestionSlides } from "./pptx/slides";
import { PPTXExportConfig, DEFAULT_EXPORT_CONFIG } from "../types/exportConfig";
import { getTheme, getSlideMasters } from "./pptx/theme";

type ProgressCallback = (progress: number) => void;

// Main export function
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
    const theme = getTheme(config.theme);
    const slideMasters = getSlideMasters(config.theme);
    
    // Calculate total steps for progress tracking
    let totalSteps = 0;
    if (config.slides.includeTitleSlide) totalSteps++;
    if (config.slides.includeCompletionSlide) totalSteps++;
    if (config.slides.includeTrendSlide) totalSteps++;
    
    // If including question slides, count those too
    if (config.slides.includeQuestionSlides) {
      // Get questions, filtering text questions if needed
      const filteredQuestions = processedData.questions.filter(question => {
        if (config.questions.excludeTextQuestions && (question.type === "text" || question.type === "comment")) {
          return false;
        }
        return config.questions.includedQuestionIds === "all" || 
               (Array.isArray(config.questions.includedQuestionIds) && 
                config.questions.includedQuestionIds.includes(question.id));
      });
      
      // Each question has a main slide plus comparison slides
      totalSteps += filteredQuestions.length * (1 + config.comparisons.dimensions.length);
    }
    
    // Set presentation properties
    pptx.author = "Survey System";
    pptx.company = "Your Company";
    pptx.revision = "1";
    pptx.subject = campaign.name;
    pptx.title = campaign.name;
    
    // Add branding if configured
    if (config.branding.includeLogo && config.branding.logoUrl) {
      pptx.defineSlideMaster({
        title: "BRANDED",
        background: { color: "#FFFFFF" },
        objects: [
          { image: { x: 0.5, y: 6.5, w: 1, h: 0.5, path: config.branding.logoUrl } }
        ]
      });
    }
    
    if (config.branding.includeFooter && config.branding.footerText) {
      pptx.defineSlideMaster({
        title: "FOOTER",
        background: { color: "#FFFFFF" },
        objects: [
          { text: { 
            text: config.branding.footerText,
            x: 0.5, y: 7, w: "90%", h: 0.3,
            fontSize: 10, color: theme.text.secondary, align: "center"
          }}
        ]
      });
    }

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

    // Create question slides with comparisons if configured
    if (config.slides.includeQuestionSlides) {
      await createQuestionSlides(
        pptx, 
        campaign, 
        processedData, 
        theme,
        slideMasters,
        {
          excludeTextQuestions: config.questions.excludeTextQuestions,
          includedQuestionIds: config.questions.includedQuestionIds,
          comparisonDimensions: config.comparisons.dimensions
        },
        () => {
          currentProgress += 1;
          onProgress?.(Math.round((currentProgress / totalSteps) * 100));
        }
      );
    }

    // Save the presentation
    const fileName = `${campaign.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_presentation.pptx`;
    await pptx.writeFile({ fileName });

    onProgress?.(100); // Ensure we reach 100%
    return fileName;
  } catch (error) {
    console.error("Error exporting presentation:", error);
    throw error;
  }
};
