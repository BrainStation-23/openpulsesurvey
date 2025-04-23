
import pptxgen from "pptxgenjs";
import { fetchPresentationData } from "./fetchPresentationData";
import { PptxExportOptions, ProgressCallback } from "./types";
import { createTitleSlide, createCompletionSlide, createQuestionSlides } from "./slides";

/**
 * Service for exporting survey data to PPTX
 */
export class PptxExportService {
  /**
   * Export presentation to PPTX
   */
  static async exportToPptx({
    campaignId,
    instanceId,
    onProgress
  }: PptxExportOptions): Promise<string> {
    try {
      const pptx = new pptxgen();
      let currentProgress = 0;
      
      // Report initial progress
      onProgress?.(0);
      
      // Fetch presentation data
      const presentationData = await fetchPresentationData(campaignId, instanceId);
      
      // Calculate total steps for progress reporting
      const questionCount = presentationData.questions.filter(
        q => q.type !== "text" && q.type !== "comment"
      ).length;
      const totalSteps = 2 + questionCount; // Title, completion + questions
      
      // Update progress after data fetching (10%)
      currentProgress = 10;
      onProgress?.(currentProgress);
      
      // Set presentation properties
      pptx.author = "Survey System";
      pptx.company = "Your Company";
      pptx.revision = "1";
      pptx.subject = presentationData.campaign.name;
      pptx.title = presentationData.campaign.name;

      // Create title slide
      createTitleSlide(pptx, presentationData.campaign);
      currentProgress += Math.round((1 / totalSteps) * 80); // 80% is for slides creation
      onProgress?.(currentProgress);

      // Create completion rate slide
      createCompletionSlide(pptx, presentationData.campaign);
      currentProgress += Math.round((1 / totalSteps) * 80);
      onProgress?.(currentProgress);

      // Create question slides with comparisons
      await createQuestionSlides(pptx, presentationData, () => {
        currentProgress += Math.round((1 / totalSteps) * 80);
        onProgress?.(Math.min(90, currentProgress)); // Cap at 90% until file is saved
      });

      // Save the presentation
      const fileName = `${presentationData.campaign.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_presentation.pptx`;
      await pptx.writeFile({ fileName });

      onProgress?.(100); // Complete
      return fileName;
    } catch (error) {
      console.error("Error exporting presentation:", error);
      throw error;
    }
  }
}
