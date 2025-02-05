import pptxgen from "pptxgenjs";
import { CampaignData } from "../types";
import { format } from "date-fns";

// Helper to create a clean text from HTML content
const cleanText = (text: string) => {
  return text.replace(/<[^>]*>/g, '');
};

// Helper to format dates consistently
const formatDate = (date: string) => {
  return format(new Date(date), "PPP");
};

export const exportToPptx = async (campaign: CampaignData) => {
  const pptx = new pptxgen();
  
  // Set presentation properties
  pptx.author = "Survey System";
  pptx.company = "Your Company";
  pptx.revision = "1";
  pptx.subject = campaign.name;
  pptx.title = campaign.name;

  // Title Slide
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: "FFFFFF" };
  titleSlide.addText(campaign.name, {
    x: 0.5,
    y: 0.5,
    w: "90%",
    fontSize: 44,
    bold: true,
    color: "363636",
  });
  
  if (campaign.description) {
    titleSlide.addText(campaign.description, {
      x: 0.5,
      y: 2,
      w: "90%",
      fontSize: 20,
      color: "666666",
    });
  }

  titleSlide.addText([
    { text: "Period: ", options: { bold: true } },
    { text: `${formatDate(campaign.starts_at)} - ${formatDate(campaign.ends_at)}` },
    { text: "\nCompletion Rate: ", options: { bold: true } },
    { text: `${campaign.completion_rate?.toFixed(1)}%` },
  ], {
    x: 0.5,
    y: 4,
    w: "90%",
    fontSize: 16,
    color: "666666",
  });

  // Completion Rate Slide
  const completionSlide = pptx.addSlide();
  completionSlide.background = { color: "FFFFFF" };
  completionSlide.addText("Campaign Completion", {
    x: 0.5,
    y: 0.5,
    fontSize: 32,
    bold: true,
    color: "363636",
  });

  completionSlide.addText(`${campaign.completion_rate?.toFixed(1)}%`, {
    x: 0.5,
    y: 2,
    fontSize: 72,
    bold: true,
    color: campaign.completion_rate >= 75 ? "22c55e" : 
           campaign.completion_rate >= 50 ? "eab308" : "ef4444",
  });

  completionSlide.addText("Overall Completion Rate", {
    x: 0.5,
    y: 3.5,
    fontSize: 20,
    color: "666666",
  });

  // For each question in the survey, create a slide
  const surveyQuestions = (campaign.survey.json_data.pages || []).flatMap(
    (page) => page.elements || []
  );

  surveyQuestions.forEach((question) => {
    const questionSlide = pptx.addSlide();
    questionSlide.background = { color: "FFFFFF" };
    
    // Add question title
    questionSlide.addText(cleanText(question.title), {
      x: 0.5,
      y: 0.5,
      w: "90%",
      fontSize: 28,
      bold: true,
      color: "363636",
      wrap: true,
    });

    // Add placeholder for chart/data visualization
    questionSlide.addText("Response data visualization will be added here", {
      x: 0.5,
      y: 2,
      w: "90%",
      fontSize: 16,
      color: "666666",
      italic: true,
    });
  });

  // Save the presentation
  const fileName = `${campaign.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_presentation.pptx`;
  await pptx.writeFile({ fileName });
};