
import pptxgen from "pptxgenjs";
import { CampaignData } from "../types";
import { ProcessedData } from "../types/responses";
import { ExportConfig, DEFAULT_EXPORT_CONFIG } from "./config/exportConfig";

// Import individual slide creators
import { createTitleSlide } from "./slides/titleSlide";
import { createCompletionSlide } from "./slides/completionSlide";
import { createQuestionSlides } from "./slides/questionSlides";

// Re-export for backward compatibility
export { createTitleSlide, createCompletionSlide };

// Enhanced question slides creation with configuration
export const createQuestionSlidesWithConfig = async (
  pptx: pptxgen, 
  campaign: CampaignData, 
  processedData: ProcessedData,
  config: ExportConfig = DEFAULT_EXPORT_CONFIG,
  onProgress?: (progress: number) => void
) => {
  return createQuestionSlides(pptx, campaign, processedData, config, onProgress);
};

// Legacy function for backward compatibility
export const createQuestionSlides = async (
  pptx: pptxgen, 
  campaign: CampaignData, 
  processedData: ProcessedData,
  onProgress?: (progress: number) => void
) => {
  return createQuestionSlidesWithConfig(pptx, campaign, processedData, DEFAULT_EXPORT_CONFIG, onProgress);
};
