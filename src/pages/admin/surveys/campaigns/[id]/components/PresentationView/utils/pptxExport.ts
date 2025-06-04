
import pptxgen from "pptxgenjs";
import { CampaignData } from "../types";
import { ProcessedData } from "../types/responses";
import { createTitleSlide, createCompletionSlide, createQuestionSlides } from "./pptx/slides";

/**
 * PPTX export generation is now decoupled from the React slide rendering logic.
 * This file should NEVER rely on any React components or hooks.
 * All helpers for PPTX slide creation are pure functions
 * that operate on campaign/question/response data, not on UI elements.
 */

type ProgressCallback = (progress: number) => void;

// Main export function (remains a pure data-driven implementation)
export const exportToPptx = async (
  campaign: CampaignData,
  processedData: ProcessedData,
  onProgress?: ProgressCallback
) => {
  try {
    const pptx = new pptxgen();
    let currentProgress = 0;
    const totalSteps = 3 + (processedData.questions?.length || 0); // Title, completion, trends + questions

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

    // Create completion rate slide with processed data
    await createCompletionSlide(pptx, campaign);
    currentProgress += 1;
    onProgress?.(Math.round((currentProgress / totalSteps) * 100));

    // Generate each question's PPTX slides (purely via campaign/processedData, not React)
    await createQuestionSlides(pptx, campaign, processedData, () => {
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
