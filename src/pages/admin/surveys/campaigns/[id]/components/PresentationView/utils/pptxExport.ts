
import pptxgen from "pptxgenjs";
import { CampaignData } from "../types";
import { ProcessedData } from "../types/responses";
import { createTitleSlide, createCompletionSlide, createQuestionSlides } from "./pptx/slides";

// Main export function
export const exportToPptx = async (
  campaign: CampaignData,
  processedData: ProcessedData
) => {
  try {
    const pptx = new pptxgen();
    
    // Set presentation properties
    pptx.author = "Survey System";
    pptx.company = "Your Company";
    pptx.revision = "1";
    pptx.subject = campaign.name;
    pptx.title = campaign.name;

    // Create title slide
    createTitleSlide(pptx, campaign);

    // Create completion rate slide
    createCompletionSlide(pptx, campaign);

    // Create question slides with comparisons
    await createQuestionSlides(pptx, campaign, processedData);

    // Save the presentation
    const fileName = `${campaign.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_presentation.pptx`;
    await pptx.writeFile({ fileName });

    return fileName;
  } catch (error) {
    console.error("Error exporting presentation:", error);
    throw error;
  }
};
