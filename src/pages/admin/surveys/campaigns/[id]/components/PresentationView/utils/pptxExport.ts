import pptxgen from "pptxgenjs";
import { CampaignData } from "../types";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

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

// Helper to get response data for a question
const getQuestionResponses = async (campaignId: string, questionName: string, instanceId?: string) => {
  try {
    const query = supabase
      .from("survey_responses")
      .select(`
        response_data,
        assignment:survey_assignments!inner(
          campaign_id
        )
      `)
      .eq("assignment.campaign_id", campaignId);

    if (instanceId) {
      query.eq("campaign_instance_id", instanceId);
    }

    const { data: responses, error } = await query;
    
    if (error) {
      console.error("Error fetching responses:", error);
      return [];
    }

    return responses?.map(r => r.response_data[questionName]) || [];
  } catch (error) {
    console.error("Error in getQuestionResponses:", error);
    return [];
  }
};

// Helper to process boolean responses for charts
const processBooleanResponses = (responses: any[]) => {
  try {
    const counts = responses.reduce((acc: { [key: string]: number }, value) => {
      const key = value ? "Yes" : "No";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, { "Yes": 0, "No": 0 });

    return [{
      name: "Responses",
      labels: ["Yes", "No"],
      values: [counts["Yes"], counts["No"]]
    }];
  } catch (error) {
    console.error("Error processing boolean responses:", error);
    return [{
      name: "Responses",
      labels: ["Yes", "No"],
      values: [0, 0]
    }];
  }
};

// Helper to process rating responses for charts
const processRatingResponses = (responses: any[], maxRating: number = 5) => {
  try {
    const counts = responses.reduce((acc: { [key: string]: number }, value) => {
      if (typeof value === 'number' && value >= 1 && value <= maxRating) {
        acc[value] = (acc[value] || 0) + 1;
      }
      return acc;
    }, {});

    const labels = Array.from({ length: maxRating }, (_, i) => `${i + 1}`);
    const values = labels.map(label => counts[label] || 0);

    return [{
      name: "Responses",
      labels,
      values
    }];
  } catch (error) {
    console.error("Error processing rating responses:", error);
    return [{
      name: "Responses",
      labels: ["1"],
      values: [0]
    }];
  }
};

export const exportToPptx = async (campaign: CampaignData) => {
  try {
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
      { text: `${formatDate(campaign.starts_at)} - ${campaign.ends_at ? formatDate(campaign.ends_at) : 'Ongoing'}` },
      { text: "\nCompletion Rate: ", options: { bold: true } },
      { text: `${campaign.completion_rate?.toFixed(1)}%` },
    ], {
      x: 0.5,
      y: 4,
      w: "90%",
      fontSize: 16,
      color: "666666",
    });

    // Completion Rate Slide with Donut Chart
    const completionSlide = pptx.addSlide();
    completionSlide.background = { color: "FFFFFF" };
    completionSlide.addText("Campaign Completion", {
      x: 0.5,
      y: 0.5,
      fontSize: 32,
      bold: true,
      color: "363636",
    });

    const completionData = [{
      name: "Completion",
      labels: ["Completed", "Pending"],
      values: [campaign.completion_rate || 0, 100 - (campaign.completion_rate || 0)]
    }];

    completionSlide.addChart(pptx.ChartType.doughnut, completionData, {
      x: 1,
      y: 1.5,
      w: 8,
      h: 5,
      chartColors: ['#22c55e', '#ef4444'],
      showLegend: true,
      legendPos: 'b',
      dataLabelFormatCode: '0"%"'
    });

    // For each question in the survey, create a slide with appropriate chart
    const surveyQuestions = (campaign.survey.json_data.pages || []).flatMap(
      (page) => page.elements || []
    );

    for (const question of surveyQuestions) {
      const responses = await getQuestionResponses(campaign.id, question.name, campaign.instance?.id);
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

      // Add appropriate chart based on question type
      if (question.type === "boolean") {
        const data = processBooleanResponses(responses);
        questionSlide.addChart(pptx.ChartType.bar, data, {
          x: 1,
          y: 1.5,
          w: 8,
          h: 5,
          chartColors
          showValue: true,
          barDir: 'bar',
          dataLabelPosition: 'outEnd'
        });
      } else if (question.type === "rating") {
        const maxRating = question.rateMax || 5;
        const data = processRatingResponses(responses, maxRating);
        questionSlide.addChart(pptx.ChartType.bar, data, {
          x: 1,
          y: 1.5,
          w: 8,
          h: 5,
          chartColors: ['#8884d8'],
          showValue: true,
          barDir: 'col',
          dataLabelPosition: 'outEnd'
        });
      }
    }

    // Save the presentation with a sanitized filename
    const fileName = `${campaign.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_presentation.pptx`;
    await pptx.writeFile({ fileName });
  } catch (error) {
    console.error("Error exporting presentation:", error);
    throw error;
  }
};