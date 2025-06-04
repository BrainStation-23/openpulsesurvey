
import pptxgen from "pptxgenjs";
import { CampaignData } from "../types";
import { ProcessedData } from "../types/responses";
import { createTitleSlide, createCompletionSlide, createQuestionSlidesWithConfig } from "./pptx/slides";
import { ExportConfig, DEFAULT_EXPORT_CONFIG } from "./pptx/config/exportConfig";

/**
 * PPTX export generation is now decoupled from the React slide rendering logic.
 * This file should NEVER rely on any React components or hooks.
 * All helpers for PPTX slide creation are pure functions
 * that operate on campaign/question/response data, not on UI elements.
 */

type ProgressCallback = (progress: number) => void;

// Enhanced export function with configuration support
export const exportToPptxWithConfig = async (
  campaign: CampaignData,
  processedData: ProcessedData,
  config: ExportConfig = DEFAULT_EXPORT_CONFIG,
  onProgress?: ProgressCallback
) => {
  try {
    const pptx = new pptxgen();
    let currentProgress = 0;
    
    // Calculate total steps based on configuration
    const enabledDimensions = config.dimensions.filter(dim => dim.enabled);
    const questionsCount = processedData.questions?.filter(
      question => question.type !== "text" && question.type !== "comment"
    ).length || 0;
    
    let totalSteps = 1; // Title slide
    if (config.includeMainSlides) totalSteps += 1; // Completion slide
    if (config.includeMainSlides) totalSteps += questionsCount; // Main question slides
    if (config.includeComparisonSlides) totalSteps += questionsCount * enabledDimensions.length; // Comparison slides

    // Set presentation properties
    pptx.author = "Survey System";
    pptx.company = "Your Company";
    pptx.revision = "1";
    pptx.subject = campaign.name;
    pptx.title = campaign.name;

    // Create title slide
    createTitleSlide(pptx, campaign);
    currentProgress += 1;
    onProgress?.(Math.round((currentProgress / totalSteps) * 100));

    // Create completion rate slide if enabled
    if (config.includeMainSlides) {
      await createCompletionSlide(pptx, campaign);
      currentProgress += 1;
      onProgress?.(Math.round((currentProgress / totalSteps) * 100));
    }

    // Generate question slides with configuration
    await createQuestionSlidesWithConfig(pptx, campaign, processedData, config, () => {
      currentProgress += 1;
      onProgress?.(Math.round((currentProgress / totalSteps) * 100));
    });

    // Save/export the PPTX file
    const fileName = `${campaign.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_presentation.pptx`;
    await pptx.writeFile({ fileName });

    onProgress?.(100); // Ensure we reach 100%
    return fileName;
  } catch (error) {
    console.error("Error exporting presentation:", error);
    throw error;
  }
};

// Legacy export function for backward compatibility
export const exportToPptx = async (
  campaign: CampaignData,
  processedData: ProcessedData,
  onProgress?: ProgressCallback
) => {
  return exportToPptxWithConfig(campaign, processedData, DEFAULT_EXPORT_CONFIG, onProgress);
};
