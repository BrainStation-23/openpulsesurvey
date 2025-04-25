
import pptxgen from "pptxgenjs";
import { CampaignData } from "../types";
import { ProcessedData } from "../types/responses";
import { addQuestionChart, addComparisonChart } from "./pptx/charts";

export async function exportToPptx(
  campaign: CampaignData, 
  processedData: ProcessedData,
  progressCallback: (progress: number) => void
): Promise<void> {
  const pptx = new pptxgen();
  
  // Set presentation properties
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = `${campaign.name} - Presentation`;
  
  // Create title slide
  const titleSlide = pptx.addSlide();
  titleSlide.addText(campaign.name, { 
    x: 1, 
    y: 2, 
    w: '80%', 
    h: 1.5, 
    align: 'center',
    fontSize: 44,
    bold: true,
    color: '363636'
  });
  
  if (campaign.survey.name) {
    titleSlide.addText(campaign.survey.name, {
      x: 1,
      y: 3.5,
      w: '80%',
      h: 1,
      align: 'center',
      fontSize: 24,
      color: '666666'
    });
  }
  
  // Calculate total slides for progress tracking
  const surveyQuestions = (campaign.survey.json_data.pages || [])
    .flatMap(page => page.elements || [])
    .filter(q => q.type !== "text" && q.type !== "comment");
  
  const totalSlides = 1 + surveyQuestions.length; // Title + questions
  let slidesCompleted = 1; // Title slide is done
  
  // Report initial progress
  progressCallback(Math.round((slidesCompleted / totalSlides) * 100));
  
  // Create slides for each question
  for (const question of surveyQuestions) {
    const questionSlide = pptx.addSlide();
    
    // Add question title
    questionSlide.addText(question.title || question.name, {
      x: 0.5,
      y: 0.5,
      w: '90%',
      h: 0.75,
      fontSize: 18,
      bold: true,
      color: '363636'
    });
    
    // Add chart based on question type
    await addQuestionChart(questionSlide, question, processedData);
    
    // Update progress
    slidesCompleted++;
    progressCallback(Math.round((slidesCompleted / totalSlides) * 100));
  }
  
  // Save the presentation
  await pptx.writeFile({ fileName: `${campaign.name}_Presentation.pptx` });
}
