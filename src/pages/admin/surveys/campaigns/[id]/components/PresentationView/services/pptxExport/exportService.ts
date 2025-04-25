
import pptxgen from "pptxgenjs";
import { CampaignData } from "../../types";
import { 
  PptxExportConfig, 
  DEFAULT_EXPORT_CONFIG,
  QuestionResponseData
} from "./types";
import { 
  createTitleSlide, 
  createCompletionSlide,
  createTrendsSlide,
  createQuestionSlides
} from "./slideGenerator";
import { fetchPresentationData } from "./dataProvider";

/**
 * Main export function that generates and downloads a PPTX presentation
 */
export const exportToPptx = async (
  campaign: CampaignData,
  instanceId?: string,
  config: Partial<PptxExportConfig> = {}
): Promise<string> => {
  try {
    // Merge provided config with defaults
    const mergedConfig: PptxExportConfig = {
      ...DEFAULT_EXPORT_CONFIG,
      ...config
    };
    
    // Set up progress tracking
    let currentProgress = 0;
    const totalSteps = 3 + (
      (mergedConfig.includeQuestionSlides ? 1 : 0) + 
      (mergedConfig.includeTitleSlide ? 1 : 0) + 
      (mergedConfig.includeCompletionSlide ? 1 : 0) + 
      (mergedConfig.includeTrendsSlide ? 1 : 0)
    );
    const updateProgress = () => {
      currentProgress += 1;
      if (mergedConfig.onProgress) {
        mergedConfig.onProgress(Math.round((currentProgress / totalSteps) * 100));
      }
    };

    // Create a new presentation
    const pptx = new pptxgen();
    
    // Set presentation metadata
    pptx.author = mergedConfig.author || "Survey System";
    pptx.company = mergedConfig.company || "Your Company";
    pptx.revision = "1";
    pptx.subject = campaign.name;
    pptx.title = campaign.name;

    // Generate standard slides if requested
    if (mergedConfig.includeTitleSlide) {
      createTitleSlide(pptx, campaign, mergedConfig.theme);
      updateProgress();
    }

    if (mergedConfig.includeCompletionSlide) {
      createCompletionSlide(pptx, campaign, mergedConfig.theme);
      updateProgress();
    }

    if (mergedConfig.includeTrendsSlide) {
      createTrendsSlide(pptx, campaign, mergedConfig.theme);
      updateProgress();
    }

    // Fetch data and generate question slides
    if (mergedConfig.includeQuestionSlides) {
      // Only fetch data if we're including question slides
      const questionsData: QuestionResponseData[] = await fetchPresentationData(
        campaign,
        instanceId,
        mergedConfig.dimensions,
        mergedConfig.excludeQuestionTypes,
        mergedConfig.onlyIncludeQuestions
      );
      
      // Generate all question slides
      createQuestionSlides(pptx, questionsData, mergedConfig.theme);
      updateProgress();
    }

    // Generate the filename
    const fileName = mergedConfig.fileName || 
      `${campaign.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_presentation.pptx`;
    
    // Save and download the file
    await pptx.writeFile({ fileName });
    
    // Ensure we reach 100% progress
    if (mergedConfig.onProgress) {
      mergedConfig.onProgress(100);
    }
    
    return fileName;
  } catch (error) {
    console.error("Error exporting presentation:", error);
    throw error;
  }
};
