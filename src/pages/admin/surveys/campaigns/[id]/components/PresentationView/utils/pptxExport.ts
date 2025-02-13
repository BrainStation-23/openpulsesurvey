
import pptxgen from "pptxgenjs";
import { CampaignData } from "../types";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import type { ProcessedData } from "../types/responses";
import { COMPARISON_DIMENSIONS } from "../constants";

// Theme configuration
const THEME = {
  primary: "#9b87f5",
  secondary: "#7E69AB",
  tertiary: "#6E59A5",
  dark: "#1A1F2C",
  light: "#F1F0FB",
  text: {
    primary: "#1A1F2C",
    secondary: "#6E59A5",
    light: "#8E9196"
  },
  chart: {
    colors: ["#9b87f5", "#7E69AB", "#6E59A5", "#D946EF"]
  }
};

// Slide masters
const slideMasters = {
  TITLE: {
    background: { color: "FFFFFF" },
    margin: [0.5, 0.5, 0.5, 0.5],
  },
  CONTENT: {
    background: { color: "FFFFFF" },
    margin: [0.5, 0.5, 0.5, 0.5],
  },
  CHART: {
    background: { color: "FFFFFF" },
    margin: [0.5, 1, 0.5, 0.5],
  }
};

// Helper to create a clean text from HTML content
const cleanText = (text: string) => {
  return text.replace(/<[^>]*>/g, '');
};

// Helper to format dates consistently
const formatDate = (date: string) => {
  try {
    return format(new Date(date), "PPP");
  } catch (error) {
    console.error("Error formatting date:", error);
    return date;
  }
};

// Helper to get response data
const getQuestionResponses = async (campaignId: string, instanceId?: string) => {
  const { data: responses, error } = await supabase
    .from("survey_responses")
    .select(`
      response_data,
      submitted_at,
      user:profiles!inner(
        gender,
        location:locations(id, name),
        employment_type:employment_types(id, name),
        level:levels(id, name),
        employee_type:employee_types(id, name),
        employee_role:employee_roles(id, name),
        user_sbus:user_sbus(
          is_primary,
          sbu:sbus(id, name)
        )
      )
    `)
    .eq("campaign_instance_id", instanceId);

  if (error) {
    console.error("Error fetching responses:", error);
    throw error;
  }

  return responses;
};

// Create title slide
const createTitleSlide = (pptx: pptxgen, campaign: CampaignData) => {
  const slide = pptx.addSlide();
  Object.assign(slide, slideMasters.TITLE);

  slide.addText(campaign.name, {
    x: 0.5,
    y: 0.5,
    w: "90%",
    fontSize: 44,
    bold: true,
    color: THEME.text.primary,
  });

  if (campaign.description) {
    slide.addText(campaign.description, {
      x: 0.5,
      y: 2,
      w: "90%",
      fontSize: 20,
      color: THEME.text.secondary,
    });
  }

  const startDate = campaign.instance?.starts_at || campaign.starts_at;
  const endDate = campaign.instance?.ends_at || campaign.ends_at;
  const completionRate = campaign.instance?.completion_rate ?? campaign.completion_rate;

  slide.addText([
    { text: "Period: ", options: { bold: true } },
    { text: `${formatDate(startDate)} - ${formatDate(endDate)}` },
    { text: "\nCompletion Rate: ", options: { bold: true } },
    { text: `${completionRate?.toFixed(1)}%` },
  ], {
    x: 0.5,
    y: 4,
    w: "90%",
    fontSize: 16,
    color: THEME.text.light,
  });
};

// Create completion rate slide
const createCompletionSlide = (pptx: pptxgen, campaign: CampaignData) => {
  const slide = pptx.addSlide();
  Object.assign(slide, slideMasters.CHART);

  slide.addText("Campaign Completion", {
    x: 0.5,
    y: 0.5,
    fontSize: 32,
    bold: true,
    color: THEME.text.primary,
  });

  const completionData = [{
    name: "Completion",
    labels: ["Completed", "Pending"],
    values: [campaign.completion_rate || 0, 100 - (campaign.completion_rate || 0)]
  }];

  slide.addChart(pptx.ChartType.doughnut, completionData, {
    x: 1,
    y: 1.5,
    w: 8,
    h: 5,
    chartColors: [THEME.primary, THEME.light],
    showLegend: true,
    legendPos: 'b',
    dataLabelFormatCode: '0"%"'
  });
};

// Create question slides
const createQuestionSlides = async (
  pptx: pptxgen, 
  campaign: CampaignData, 
  processedData: ProcessedData
) => {
  const { questions } = processedData;

  for (const question of questions) {
    // Main question slide
    const mainSlide = pptx.addSlide();
    Object.assign(mainSlide, slideMasters.CHART);

    mainSlide.addText(cleanText(question.title), {
      x: 0.5,
      y: 0.5,
      w: "90%",
      fontSize: 28,
      bold: true,
      color: THEME.text.primary,
      wrap: true,
    });

    // Add chart based on question type
    await addQuestionChart(mainSlide, question, processedData);

    // Create comparison slides
    for (const dimension of COMPARISON_DIMENSIONS) {
      const comparisonSlide = pptx.addSlide();
      Object.assign(comparisonSlide, slideMasters.CHART);

      comparisonSlide.addText(cleanText(question.title), {
        x: 0.5,
        y: 0.5,
        w: "90%",
        fontSize: 24,
        bold: true,
        color: THEME.text.primary,
        wrap: true,
      });

      comparisonSlide.addText(`Response Distribution by ${dimension}`, {
        x: 0.5,
        y: 1.2,
        fontSize: 20,
        color: THEME.text.secondary,
      });

      // Add comparison chart
      await addComparisonChart(comparisonSlide, question, processedData, dimension);
    }
  }
};

// Helper to add appropriate chart for question type
const addQuestionChart = async (
  slide: pptxgen.Slide,
  question: any,
  processedData: ProcessedData
) => {
  switch (question.type) {
    case "boolean":
      // Add boolean chart
      break;
    case "rating":
      // Add rating chart
      break;
    case "text":
    case "comment":
      // Add word cloud or text analysis
      break;
  }
};

// Helper to add comparison chart
const addComparisonChart = async (
  slide: pptxgen.Slide,
  question: any,
  processedData: ProcessedData,
  dimension: string
) => {
  // Add comparison chart logic here
};

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
