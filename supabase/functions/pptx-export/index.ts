import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import PptxGenJS from "https://esm.sh/pptxgenjs@3.12.0";
import { corsHeaders } from "../_shared/cors.ts";

// Configuration types
export interface ExportConfig {
  dimensions?: string[];
  theme?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    light?: string;
    dark?: string;
    text?: {
      primary?: string;
      secondary?: string;
      light?: string;
    };
    chart?: {
      colors?: string[];
    };
  };
  includeTitle?: boolean;
  includeCompletionRate?: boolean;
  includeResponseTrends?: boolean;
  includeTextResponses?: boolean;
  fileName?: string;
  company?: string;
  author?: string;
}

// Default theme
const DEFAULT_THEME = {
  primary: "#9b87f5",
  secondary: "#7E69AB",
  tertiary: "#6E59A5",
  dark: "#1A1F2C",
  light: "#F1F0FB",
  danger: "#E11D48",
  text: {
    primary: "#1A1F2C",
    secondary: "#6E59A5",
    light: "#8E9196"
  },
  chart: {
    colors: [
      "#9b87f5", // Primary Purple
      "#F97316", // Bright Orange
      "#0EA5E9", // Ocean Blue
      "#7E69AB", // Secondary Purple
      "#22C55E", // Green
      "#EAB308", // Yellow
      "#EC4899", // Pink
      "#6366F1", // Indigo
      "#14B8A6", // Teal
      "#8B5CF6"  // Violet
    ]
  }
};

// Default slide masters
const DEFAULT_SLIDE_MASTERS = {
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

// Default dimensions to include
const DEFAULT_DIMENSIONS = [
  'sbu', 
  'gender', 
  'location', 
  'employment_type',
  'level',
  'employee_type',
  'employee_role',
  'supervisor'
];

// Create a single Supabase client for interacting with your database
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper to format dates consistently
const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateStr;
  }
};

// Helper to create a clean text from HTML content
const cleanText = (text: string) => {
  return text.replace(/<[^>]*>/g, '');
};

// Main function to generate PPTX presentation
async function generatePptx(
  campaignId: string, 
  instanceId: string | null,
  config: ExportConfig = {},
  onProgress?: (progress: number) => void
) {
  console.log(`Starting PPTX generation for campaign ${campaignId}, instance ${instanceId}`);
  
  // Merge config with defaults
  const exportConfig = {
    dimensions: config.dimensions || DEFAULT_DIMENSIONS,
    theme: { ...DEFAULT_THEME, ...(config.theme || {}) },
    includeTitle: config.includeTitle !== false,
    includeCompletionRate: config.includeCompletionRate !== false,
    includeResponseTrends: config.includeResponseTrends !== false,
    includeTextResponses: config.includeTextResponses !== false,
    fileName: config.fileName || `survey_presentation`,
    company: config.company || "Your Company",
    author: config.author || "Survey System",
  };
  
  // Initialize presentation
  const pptx = new PptxGenJS();
  pptx.author = exportConfig.author;
  pptx.company = exportConfig.company;
  pptx.title = exportConfig.fileName;
  
  try {
    // Step 1: Fetch campaign data
    const campaignData = await fetchCampaignData(campaignId, instanceId);
    if (!campaignData) throw new Error("Failed to fetch campaign data");
    
    // Use campaign name for title if not explicitly set
    pptx.title = config.fileName || campaignData.name;
    
    // Step 2: Create title slide
    if (exportConfig.includeTitle) {
      await createTitleSlide(pptx, campaignData, exportConfig.theme);
      onProgress?.(10);
    }
    
    // Step 3: Create completion rate slide
    if (exportConfig.includeCompletionRate) {
      await createCompletionSlide(pptx, campaignData, exportConfig.theme);
      onProgress?.(20);
    }
    
    // Step 4: Create response trends slide
    if (exportConfig.includeResponseTrends) {
      await createTrendsSlide(pptx, campaignData, instanceId, exportConfig.theme);
      onProgress?.(30);
    }
    
    // Step 5: Process all questions with their dimension slides
    const questions = await getQuestions(campaignData);
    if (!questions || questions.length === 0) {
      throw new Error("No questions found in survey");
    }
    
    // Filter questions (exclude text and comment types)
    const filteredQuestions = questions.filter(q => 
      q.type !== "text" && q.type !== "comment"
    );
    
    // Total slides calculation for progress
    const totalQuestionSlides = filteredQuestions.length * (1 + exportConfig.dimensions.length);
    let currentQuestionSlide = 0;
    
    // Generate slides for each question
    for (const question of filteredQuestions) {
      // Main question slide
      await createQuestionSlide(pptx, campaignData, instanceId, question, null, exportConfig.theme);
      currentQuestionSlide++;
      
      // Update progress
      const progressPercent = 30 + (currentQuestionSlide / totalQuestionSlides) * 70;
      onProgress?.(progressPercent);
      
      // Dimension comparison slides
      for (const dimension of exportConfig.dimensions) {
        await createQuestionSlide(pptx, campaignData, instanceId, question, dimension, exportConfig.theme);
        currentQuestionSlide++;
        
        // Update progress
        const progressPercent = 30 + (currentQuestionSlide / totalQuestionSlides) * 70;
        onProgress?.(progressPercent);
      }
    }
    
    // Generate the PPTX file
    const buffer = await pptx.write({ outputType: "nodebuffer" });
    return buffer;
    
  } catch (error) {
    console.error("Error generating PPTX:", error);
    throw error;
  }
}

// Fetch campaign data and survey structure
async function fetchCampaignData(campaignId: string, instanceId: string | null) {
  const { data, error } = await supabase
    .from("survey_campaigns")
    .select(`
      id,
      name,
      description,
      starts_at,
      ends_at,
      completion_rate,
      survey:surveys (
        id,
        name,
        description,
        json_data
      )
    `)
    .eq("id", campaignId)
    .single();

  if (error) throw error;

  let instance = null;
  if (instanceId) {
    const { data: instanceData, error: instanceError } = await supabase
      .from("campaign_instances")
      .select("*")
      .eq("id", instanceId)
      .single();

    if (instanceError) throw instanceError;
    instance = instanceData;
  }
  
  const parsedJsonData = typeof data.survey.json_data === 'string' 
    ? JSON.parse(data.survey.json_data) 
    : data.survey.json_data;
  
  return {
    ...data,
    instance,
    survey: {
      ...data.survey,
      json_data: parsedJsonData
    }
  };
}

// Extract questions from survey JSON data
async function getQuestions(campaignData: any) {
  const pages = campaignData.survey.json_data.pages || [];
  return pages.flatMap(page => page.elements || []);
}

// Fetch responses for a specific question
async function fetchQuestionResponses(campaignId: string, instanceId: string | null, questionName: string, questionType: string) {
  try {
    if (questionType === "boolean") {
      return await fetchBooleanResponses(campaignId, instanceId, questionName);
    } else if (questionType === "rating" && questionName.toLowerCase().includes("recommend")) {
      return await fetchNpsResponses(campaignId, instanceId, questionName);
    } else if (questionType === "rating") {
      return await fetchRatingResponses(campaignId, instanceId, questionName);
    } else if (questionType === "text" || questionType === "comment") {
      return await fetchTextResponses(campaignId, instanceId, questionName);
    } else {
      throw new Error(`Unsupported question type: ${questionType}`);
    }
  } catch (error) {
    console.error(`Error fetching responses for question ${questionName}:`, error);
    throw error;
  }
}

// Fetch boolean question responses
async function fetchBooleanResponses(campaignId: string, instanceId: string | null, questionName: string) {
  const { data, error } = await supabase.rpc(
    'get_boolean_responses',
    {
      p_campaign_id: campaignId,
      p_instance_id: instanceId,
      p_question_name: questionName
    }
  );

  if (error) {
    console.error("Error fetching boolean responses, falling back to manual query:", error);
    
    // Fallback to manual query
    const responses = await fetchResponsesManually(campaignId, instanceId, questionName);
    
    // Process the responses to get boolean stats
    const yesCount = responses.filter(r => 
      r.toLowerCase() === 'true' || r === '1' || r.toLowerCase() === 'yes'
    ).length;
    
    const noCount = responses.length - yesCount;
    
    return {
      yes: yesCount,
      no: noCount
    };
  }

  return data;
}

// Fetch NPS question responses
async function fetchNpsResponses(campaignId: string, instanceId: string | null, questionName: string) {
  const { data, error } = await supabase.rpc(
    'get_nps_responses',
    {
      p_campaign_id: campaignId,
      p_instance_id: instanceId,
      p_question_name: questionName
    }
  );

  if (error) {
    console.error("Error fetching NPS responses, falling back to manual query:", error);
    
    // Fallback to manual query
    const responses = await fetchResponsesManually(campaignId, instanceId, questionName);
    
    // Convert to numbers and filter valid responses
    const validResponses = responses
      .map(r => parseInt(r, 10))
      .filter(r => !isNaN(r) && r >= 0 && r <= 10);
    
    const detractors = validResponses.filter(r => r <= 6).length;
    const passives = validResponses.filter(r => r >= 7 && r <= 8).length;
    const promoters = validResponses.filter(r => r >= 9).length;
    const total = validResponses.length;
    
    let npsScore = 0;
    let avgScore = 0;
    
    if (total > 0) {
      npsScore = ((promoters / total) - (detractors / total)) * 100;
      avgScore = validResponses.reduce((sum, val) => sum + val, 0) / total;
    }
    
    return {
      detractors,
      passives,
      promoters,
      total,
      nps_score: npsScore,
      avg_score: avgScore
    };
  }

  return data;
}

// Fetch rating question responses
async function fetchRatingResponses(campaignId: string, instanceId: string | null, questionName: string) {
  const { data, error } = await supabase.rpc(
    'get_satisfaction_responses',
    {
      p_campaign_id: campaignId,
      p_instance_id: instanceId,
      p_question_name: questionName
    }
  );

  if (error) {
    console.error("Error fetching rating responses, falling back to manual query:", error);
    
    // Fallback to manual query
    const responses = await fetchResponsesManually(campaignId, instanceId, questionName);
    
    // Convert to numbers and filter valid responses
    const validResponses = responses
      .map(r => parseInt(r, 10))
      .filter(r => !isNaN(r) && r >= 1 && r <= 5);
    
    const unsatisfied = validResponses.filter(r => r <= 2).length;
    const neutral = validResponses.filter(r => r === 3).length;
    const satisfied = validResponses.filter(r => r >= 4).length;
    const total = validResponses.length;
    
    // Calculate median
    let median = 0;
    if (validResponses.length > 0) {
      const sorted = [...validResponses].sort((a, b) => a - b);
      const middle = Math.floor(sorted.length / 2);
      
      if (sorted.length % 2 === 0) {
        median = (sorted[middle - 1] + sorted[middle]) / 2;
      } else {
        median = sorted[middle];
      }
    }
    
    return {
      unsatisfied,
      neutral,
      satisfied,
      total,
      median
    };
  }

  return data;
}

// Fetch text question responses
async function fetchTextResponses(campaignId: string, instanceId: string | null, questionName: string) {
  const { data, error } = await supabase.rpc(
    'get_text_responses',
    {
      p_campaign_id: campaignId,
      p_instance_id: instanceId,
      p_question_name: questionName
    }
  );

  if (error) {
    console.error("Error fetching text responses, falling back to manual query:", error);
    
    // Fallback to manual query
    const responses = await fetchResponsesManually(campaignId, instanceId, questionName);
    
    // Simple word frequency analysis
    const wordFrequency: Record<string, number> = {};
    
    responses.forEach(answer => {
      if (typeof answer === "string") {
        const words = answer
          .toLowerCase()
          .replace(/[^\w\s]/g, "")
          .split(/\s+/)
          .filter(word => word.length > 2);

        words.forEach(word => {
          wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        });
      }
    });

    return Object.entries(wordFrequency)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 50);
  }

  return data;
}

// Fallback function to manually query responses
async function fetchResponsesManually(campaignId: string, instanceId: string | null, questionName: string) {
  let query = supabase
    .from("survey_responses")
    .select(`
      response_data
    `)
    .eq("status", "submitted")
    .joins([
      {
        source: "survey_assignments",
        foreignKey: "assignment_id",
        joinType: "inner",
        sourceKey: "id",
        on: "survey_assignments.id=survey_responses.assignment_id"
      }
    ])
    .eq("survey_assignments.campaign_id", campaignId);
  
  if (instanceId) {
    query = query.eq("campaign_instance_id", instanceId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  // Extract question responses
  return data
    .map(r => r.response_data[questionName])
    .filter(r => r !== undefined && r !== null);
}

// Fetch dimension comparison data
async function fetchDimensionData(
  campaignId: string, 
  instanceId: string | null, 
  questionName: string, 
  dimension: string,
  questionType: string
) {
  try {
    if (questionType === "boolean") {
      return await fetchBooleanDimensionData(campaignId, instanceId, questionName, dimension);
    } else if (questionType === "rating" && questionName.toLowerCase().includes("recommend")) {
      return await fetchNpsDimensionData(campaignId, instanceId, questionName, dimension);
    } else {
      return await fetchSatisfactionDimensionData(campaignId, instanceId, questionName, dimension);
    }
  } catch (error) {
    console.error(`Error fetching dimension data for ${dimension}:`, error);
    return [];
  }
}

// Fetch boolean dimension data
async function fetchBooleanDimensionData(campaignId: string, instanceId: string | null, questionName: string, dimension: string) {
  const { data, error } = await supabase.rpc(
    'get_dimension_bool',
    {
      p_campaign_id: campaignId,
      p_instance_id: instanceId,
      p_question_name: questionName,
      p_dimension: dimension
    }
  );

  if (error) {
    console.error(`Error fetching boolean dimension data for ${dimension}:`, error);
    return [];
  }

  return data;
}

// Fetch NPS dimension data
async function fetchNpsDimensionData(campaignId: string, instanceId: string | null, questionName: string, dimension: string) {
  const { data, error } = await supabase.rpc(
    'get_dimension_nps',
    {
      p_campaign_id: campaignId,
      p_instance_id: instanceId,
      p_question_name: questionName,
      p_dimension: dimension
    }
  );

  if (error) {
    console.error(`Error fetching NPS dimension data for ${dimension}:`, error);
    return [];
  }

  return data;
}

// Fetch satisfaction dimension data
async function fetchSatisfactionDimensionData(campaignId: string, instanceId: string | null, questionName: string, dimension: string) {
  const { data, error } = await supabase.rpc(
    'get_dimension_satisfaction',
    {
      p_campaign_id: campaignId,
      p_instance_id: instanceId,
      p_question_name: questionName,
      p_dimension: dimension
    }
  );

  if (error) {
    console.error(`Error fetching satisfaction dimension data for ${dimension}:`, error);
    return [];
  }

  return data;
}

// Create the title slide
async function createTitleSlide(pptx: any, campaignData: any, theme: any) {
  const slide = pptx.addSlide();
  Object.assign(slide, DEFAULT_SLIDE_MASTERS.TITLE);

  slide.addText(campaignData.name, {
    x: 0.5,
    y: 0.5,
    w: "90%",
    fontSize: 44,
    bold: true,
    color: theme.text.primary,
  });

  if (campaignData.description) {
    slide.addText(campaignData.description, {
      x: 0.5,
      y: 2,
      w: "90%",
      fontSize: 20,
      color: theme.text.secondary,
    });
  }

  const startDate = campaignData.instance?.starts_at || campaignData.starts_at;
  const endDate = campaignData.instance?.ends_at || campaignData.ends_at;
  const completionRate = campaignData.instance?.completion_rate ?? campaignData.completion_rate;

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
    color: theme.text.light,
  });
}

// Create the completion rate slide
async function createCompletionSlide(pptx: any, campaignData: any, theme: any) {
  const slide = pptx.addSlide();
  Object.assign(slide, DEFAULT_SLIDE_MASTERS.CHART);

  slide.addText("Response Distribution", {
    x: 0.5,
    y: 0.5,
    fontSize: 32,
    bold: true,
    color: theme.text.primary,
  });

  // Calculate instance status distribution
  const instanceCompletionRate = campaignData.instance?.completion_rate || 0;
  const expiredRate = 0; // Fallback since the property doesn't exist in the type
  const pendingRate = 100 - (instanceCompletionRate + expiredRate);

  const data = [{
    name: "Status Distribution",
    labels: ["Completed", "Expired", "Pending"],
    values: [instanceCompletionRate, expiredRate, pendingRate]
  }];

  // Make pie chart smaller and position it on the left side
  slide.addChart(pptx.ChartType.pie, data, {
    x: 0.5,  // Position from left
    y: 1.5,  // Position from top
    w: 4.2,  // Reduced width (60% smaller)
    h: 3,    // Reduced height (60% smaller)
    chartColors: [theme.primary, theme.tertiary, theme.light],
    showLegend: true,
    legendPos: 'r',
    legendFontSize: 11,
    dataLabelFormatCode: '0"%"',
    dataLabelFontSize: 10,
    showValue: true,
  });

  // Add completion stats as text on the right side of the chart
  slide.addText([
    { text: "Response Status\n\n", options: { bold: true, fontSize: 14 } },
    { text: `Completed: `, options: { bold: true } },
    { text: `${instanceCompletionRate.toFixed(1)}%\n` },
    { text: `Expired: `, options: { bold: true } },
    { text: `${expiredRate.toFixed(1)}%\n` },
    { text: `Pending: `, options: { bold: true } },
    { text: `${pendingRate.toFixed(1)}%` },
  ], {
    x: 5.2,  // Position text to the right of the chart
    y: 2,    // Align vertically with the chart
    w: 4,    // Fixed width for text block
    fontSize: 12,
    color: theme.text.primary,
  });
}

// Create response trends slide
async function createTrendsSlide(pptx: any, campaignData: any, instanceId: string | null, theme: any) {
  const slide = pptx.addSlide();
  Object.assign(slide, DEFAULT_SLIDE_MASTERS.CHART);

  slide.addText("Response Trends", {
    x: 0.5,
    y: 0.5,
    fontSize: 32,
    bold: true,
    color: theme.text.primary,
  });

  // Fetch response trends data
  const { data: trendsData, error } = await supabase
    .from("survey_responses")
    .select("submitted_at")
    .eq("status", "submitted")
    .order("submitted_at")
    .joins([
      {
        source: "survey_assignments",
        foreignKey: "assignment_id",
        joinType: "inner",
        sourceKey: "id", 
        on: "survey_assignments.id=survey_responses.assignment_id"
      }
    ])
    .eq("survey_assignments.campaign_id", campaignData.id);

  if (error) {
    console.error("Error fetching response trends:", error);
    
    // Add a placeholder message instead of the chart
    slide.addText("Response trend data not available", {
      x: 0.5,
      y: 2,
      w: "90%",
      fontSize: 16,
      color: theme.text.secondary,
      italic: true,
    });
    
    return;
  }

  // Group responses by day
  const responsesByDay: Record<string, number> = {};
  
  trendsData.forEach(response => {
    const date = new Date(response.submitted_at);
    const dateStr = date.toISOString().split('T')[0];
    responsesByDay[dateStr] = (responsesByDay[dateStr] || 0) + 1;
  });

  // Convert to chart data format
  const chartData = [
    {
      name: "Daily Responses",
      labels: Object.keys(responsesByDay).map(date => {
        // Format date for display (e.g., "Jan 15")
        const [year, month, day] = date.split('-');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[parseInt(month) - 1]} ${parseInt(day)}`;
      }),
      values: Object.values(responsesByDay)
    }
  ];

  // Add the chart
  slide.addChart(pptx.ChartType.bar, chartData, {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 4,
    barDir: 'col',
    chartColors: [theme.primary],
    showValue: true,
    showLegend: false,
    dataLabelFontSize: 10,
    catAxisLabelFontSize: 10,
    valAxisLabelFontSize: 10,
    valAxisMaxVal: Math.max(...Object.values(responsesByDay)) * 1.2,
  });
}

// Create question slide (main or dimension)
async function createQuestionSlide(
  pptx: any,
  campaignData: any,
  instanceId: string | null,
  question: any,
  dimension: string | null,
  theme: any
) {
  const slide = pptx.addSlide();
  Object.assign(slide, DEFAULT_SLIDE_MASTERS.CHART);
  const questionType = question.type;
  const questionName = question.name;
  const questionTitle = cleanText(question.title);

  // Add the question title
  slide.addText(questionTitle, {
    x: 0.5,
    y: 0.5,
    w: "90%",
    fontSize: dimension ? 24 : 28,
    bold: true,
    color: theme.text.primary,
    wrap: true,
  });

  // Add dimension subtitle if this is a dimension slide
  if (dimension) {
    slide.addText(`Response Distribution by ${dimension}`, {
      x: 0.5,
      y: 1.2,
      fontSize: 20,
      color: theme.text.secondary,
    });
  }

  // Add appropriate chart based on question type and whether this is a dimension slide
  if (dimension) {
    await addComparisonChart(slide, pptx, campaignData, instanceId, question, dimension, theme);
  } else {
    await addMainQuestionChart(slide, pptx, campaignData, instanceId, question, theme);
  }
}

// Add main question chart
async function addMainQuestionChart(
  slide: any,
  pptx: any,
  campaignData: any,
  instanceId: string | null,
  question: any,
  theme: any
) {
  const questionType = question.type;
  const questionName = question.name;
  
  try {
    if (questionType === "boolean") {
      // Fetch boolean response data
      const responseData = await fetchBooleanResponses(campaignData.id, instanceId, questionName);
      
      // Create pie chart
      const chartData = [{
        name: "Responses",
        labels: ["Yes", "No"],
        values: [responseData.yes, responseData.no]
      }];
      
      slide.addChart(pptx.ChartType.pie, chartData, {
        x: 1,
        y: 1.8,
        w: 8,
        h: 5,
        chartColors: [theme.primary, theme.light],
        showLegend: true,
        legendPos: 'b',
        showValue: true,
        showPercent: true,
        dataLabelFontSize: 12,
      });
      
    } else if (questionType === "rating" && questionName.toLowerCase().includes("recommend")) {
      // This is an NPS question
      const responseData = await fetchNpsResponses(campaignData.id, instanceId, questionName);
      
      // NPS score
      slide.addText([
        { text: "NPS Score: ", options: { bold: true, fontSize: 16 } },
        { text: `${responseData.nps_score.toFixed(1)}`, options: { fontSize: 16 } },
      ], {
        x: 0.5,
        y: 1.5,
        w: "90%",
        color: theme.text.primary,
      });
      
      // Add NPS bar chart
      const npsData = [{
        name: "NPS Categories",
        labels: ["Detractors (0-6)", "Passives (7-8)", "Promoters (9-10)"],
        values: [responseData.detractors, responseData.passives, responseData.promoters]
      }];
      
      slide.addChart(pptx.ChartType.bar, npsData, {
        x: 0.5,
        y: 2.2,
        w: 9,
        h: 3.5,
        barDir: 'col',
        chartColors: [theme.danger, theme.light, theme.primary],
        showLegend: true,
        legendPos: 'b',
        showValue: true,
        dataLabelFontSize: 12,
      });
      
    } else if (questionType === "rating") {
      // Regular rating question
      const responseData = await fetchRatingResponses(campaignData.id, instanceId, questionName);
      
      // Add bar chart for rating distribution
      const ratingData = [{
        name: "Satisfaction",
        labels: ["Unsatisfied (1-2)", "Neutral (3)", "Satisfied (4-5)"],
        values: [responseData.unsatisfied, responseData.neutral, responseData.satisfied]
      }];
      
      slide.addChart(pptx.ChartType.bar, ratingData, {
        x: 0.5,
        y: 1.8,
        w: 9,
        h: 3.5,
        barDir: 'col',
        chartColors: [theme.danger, theme.light, theme.primary],
        showLegend: true,
        legendPos: 'b',
        showValue: true,
        valAxisMaxVal: Math.max(responseData.unsatisfied, responseData.neutral, responseData.satisfied) * 1.2,
        dataLabelFontSize: 12,
      });
      
      // Add average score
      const avgScore = ((responseData.satisfied * 4.5 + responseData.neutral * 3 + responseData.unsatisfied * 1.5) / 
                       (responseData.satisfied + responseData.neutral + responseData.unsatisfied)).toFixed(1);
      
      slide.addText([
        { text: "Average Rating: ", options: { bold: true } },
        { text: avgScore },
        { text: " out of 5" },
      ], {
        x: 0.5,
        y: 5.5,
        fontSize: 14,
        color: theme.text.primary,
      });
    }
  } catch (error) {
    console.error(`Error creating chart for question ${questionName}:`, error);
    
    // Add error message to slide
    slide.addText("Data not available for this question", {
      x: 0.5,
      y: 2,
      w: "90%",
      fontSize: 16,
      color: theme.text.secondary,
      italic: true,
    });
  }
}

// Add comparison chart for dimension slides
async function addComparisonChart(
  slide: any,
  pptx:
