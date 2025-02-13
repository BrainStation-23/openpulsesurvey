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
  const answers = processedData.responses
    .filter(r => r.answers[question.name]?.answer !== undefined)
    .map(r => r.answers[question.name].answer);

  switch (question.type) {
    case "boolean": {
      const trueCount = answers.filter(a => a === true).length;
      const falseCount = answers.filter(a => a === false).length;
      const total = trueCount + falseCount;

      const data = [{
        name: "Responses",
        labels: ["Yes", "No"] as string[],
        values: [trueCount, falseCount]
      }];

      // Add donut chart
      slide.addChart(pptxgen.ChartType.doughnut, data, {
        x: 1,
        y: 1.5,
        w: 8,
        h: 5,
        chartColors: [THEME.chart.colors[0], THEME.chart.colors[1]],
        showLegend: true,
        legendPos: 'b',
        dataLabelFormatCode: '0"%"',
        title: "Response Distribution"
      });

      // Add summary text
      slide.addText([
        { text: "Total Responses: ", options: { bold: true } },
        { text: `${total}` },
        { text: "\nYes: ", options: { bold: true, color: THEME.chart.colors[0] } },
        { text: `${trueCount} (${Math.round((trueCount / total) * 100)}%)` },
        { text: "\nNo: ", options: { bold: true, color: THEME.chart.colors[1] } },
        { text: `${falseCount} (${Math.round((falseCount / total) * 100)}%)` },
      ], {
        x: 0.5,
        y: 6.5,
        w: "90%",
        fontSize: 14,
        color: THEME.text.primary,
      });
      break;
    }

    case "rating": {
      const validAnswers = answers.filter(
        (rating) => typeof rating === "number"
      );
      
      if (question.rateCount === 10) {
        // NPS Chart
        const detractors = validAnswers.filter(r => r <= 6).length;
        const passives = validAnswers.filter(r => r > 6 && r <= 8).length;
        const promoters = validAnswers.filter(r => r > 8).length;
        const total = validAnswers.length;

        const npsScore = Math.round(
          ((promoters - detractors) / total) * 100
        );

        // Add NPS score
        slide.addText(`NPS Score: ${npsScore}`, {
          x: 0.5,
          y: 1.5,
          w: "90%",
          fontSize: 32,
          bold: true,
          color: npsScore >= 0 ? THEME.chart.colors[0] : THEME.chart.colors[1],
        });

        // Add stacked bar chart
        const data = [{
          name: "Distribution",
          labels: ["Detractors", "Passives", "Promoters"],
          values: [
            (detractors / total) * 100,
            (passives / total) * 100,
            (promoters / total) * 100
          ]
        }];

        slide.addChart(pptxgen.ChartType.bar, data, {
          x: 0.5,
          y: 2.5,
          w: 9,
          h: 3,
          barDir: "bar",
          chartColors: [THEME.chart.colors[1], THEME.chart.colors[2], THEME.chart.colors[0]],
          showLegend: true,
          legendPos: 'b',
          dataLabelFormatCode: '0"%"',
          barGrouping: "stacked",
          invertedColors: true,
        });

      } else {
        // Regular rating chart (1-5)
        const data = Array.from({ length: 5 }, (_, i) => ({
          name: `${i + 1} Star`,
          labels: [`${i + 1} Star`],
          values: [validAnswers.filter(r => r === i + 1).length]
        }));

        slide.addChart(pptxgen.ChartType.bar, data, {
          x: 0.5,
          y: 1.5,
          w: 9,
          h: 4,
          barDir: "col",
          chartColors: [THEME.chart.colors[0]],
          showLegend: false,
          dataLabelFormatCode: '0',
          catAxisTitle: "Rating",
          valAxisTitle: "Number of Responses",
        });

        // Add average rating
        const average = validAnswers.reduce((a, b) => a + b, 0) / validAnswers.length;
        slide.addText(`Average Rating: ${average.toFixed(1)}`, {
          x: 0.5,
          y: 6,
          w: "90%",
          fontSize: 16,
          bold: true,
          color: THEME.text.primary,
        });
      }
      break;
    }

    case "text":
    case "comment": {
      // Create word frequency analysis
      const wordFrequency: Record<string, number> = {};
      answers.forEach((answer) => {
        if (typeof answer === "string") {
          const words = answer
            .toLowerCase()
            .replace(/[^\w\s]/g, "")
            .split(/\s+/)
            .filter((word) => word.length > 2);

          words.forEach((word) => {
            wordFrequency[word] = (wordFrequency[word] || 0) + 1;
          });
        }
      });

      // Convert to array and sort by frequency
      const topWords = Object.entries(wordFrequency)
        .map(([text, value]) => ({
          name: text,
          labels: [text], // Added labels property as string array
          values: [value]
        }))
        .sort((a, b) => b.values[0] - a.values[0])
        .slice(0, 10);

      // Add bar chart for top words
      slide.addChart(pptxgen.ChartType.bar, topWords, {
        x: 0.5,
        y: 1.5,
        w: 9,
        h: 4,
        barDir: "col",
        chartColors: [THEME.chart.colors[0]],
        showLegend: false,
        dataLabelFormatCode: '0',
        catAxisTitle: "Words",
        valAxisTitle: "Frequency",
      });

      // Add total responses info
      slide.addText([
        { text: "Total Responses: ", options: { bold: true } },
        { text: `${answers.length}` },
        { text: "\nUnique Words: ", options: { bold: true } },
        { text: `${Object.keys(wordFrequency).length}` },
      ], {
        x: 0.5,
        y: 6,
        w: "90%",
        fontSize: 14,
        color: THEME.text.primary,
      });
      break;
    }
  }
};

// Helper to add comparison chart
const addComparisonChart = async (
  slide: pptxgen.Slide,
  question: any,
  processedData: ProcessedData,
  dimension: string
) => {
  const groupedData = new Map();

  // Group responses by dimension
  processedData.responses.forEach((response) => {
    const answer = response.answers[question.name]?.answer;
    if (answer === undefined) return;

    let groupKey = "Unknown";
    switch (dimension) {
      case "sbu":
        groupKey = response.respondent.sbu?.name || "Unknown";
        break;
      case "gender":
        groupKey = response.respondent.gender || "Unknown";
        break;
      case "location":
        groupKey = response.respondent.location?.name || "Unknown";
        break;
      case "employment_type":
        groupKey = response.respondent.employment_type?.name || "Unknown";
        break;
      case "level":
        groupKey = response.respondent.level?.name || "Unknown";
        break;
      case "employee_type":
        groupKey = response.respondent.employee_type?.name || "Unknown";
        break;
      case "employee_role":
        groupKey = response.respondent.employee_role?.name || "Unknown";
        break;
    }

    if (!groupedData.has(groupKey)) {
      groupedData.set(groupKey, []);
    }
    groupedData.get(groupKey).push(answer);
  });

  // Process data based on question type
  switch (question.type) {
    case "boolean": {
      const chartData = Array.from(groupedData.entries()).map(([group, answers]) => {
        const trueCount = answers.filter((a: boolean) => a === true).length;
        const total = answers.length;
        return {
          name: group,
          labels: [group], // Changed from ["Yes"] to [group] to match chart data structure
          values: [(trueCount / total) * 100]
        };
      });

      slide.addChart(pptxgen.ChartType.bar, chartData, {
        x: 0.5,
        y: 2,
        w: 9,
        h: 4,
        barDir: "col",
        chartColors: [THEME.chart.colors[0]],
        showLegend: false,
        dataLabelFormatCode: '0"%"',
        catAxisTitle: dimension,
        valAxisTitle: "Percentage Responding Yes",
      });
      break;
    }

    case "rating": {
      if (question.rateCount === 10) {
        // NPS comparison
        const chartData = Array.from(groupedData.entries()).map(([group, answers]) => {
          const validAnswers = answers.filter((a: number) => typeof a === "number");
          const detractors = validAnswers.filter((r: number) => r <= 6).length;
          const promoters = validAnswers.filter((r: number) => r > 8).length;
          const total = validAnswers.length;
          const npsScore = ((promoters - detractors) / total) * 100;

          return {
            name: group,
            values: [npsScore]
          };
        });

        slide.addChart(pptxgen.ChartType.bar, chartData, {
          x: 0.5,
          y: 2,
          w: 9,
          h: 4,
          barDir: "col",
          chartColors: [THEME.chart.colors[0]],
          showLegend: false,
          dataLabelFormatCode: '0',
          catAxisTitle: dimension,
          valAxisTitle: "NPS Score",
        });
      } else {
        // Regular rating comparison
        const chartData = Array.from(groupedData.entries()).map(([group, answers]) => {
          const validAnswers = answers.filter((a: number) => typeof a === "number");
          const average = validAnswers.reduce((a: number, b: number) => a + b, 0) / validAnswers.length;

          return {
            name: group,
            values: [average]
          };
        });

        slide.addChart(pptxgen.ChartType.bar, chartData, {
          x: 0.5,
          y: 2,
          w: 9,
          h: 4,
          barDir: "col",
          chartColors: [THEME.chart.colors[0]],
          showLegend: false,
          dataLabelFormatCode: '0.0',
          catAxisTitle: dimension,
          valAxisTitle: "Average Rating",
        });
      }
      break;
    }
  }
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
