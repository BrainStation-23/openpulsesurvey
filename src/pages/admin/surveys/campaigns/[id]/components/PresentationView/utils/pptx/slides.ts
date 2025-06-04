
import pptxgen from "pptxgenjs";
import { CampaignData } from "../../types";
import { ProcessedData } from "../../types/responses";
import { THEME, slideMasters } from "./theme";
import { cleanText, formatDate } from "./helpers";
import { addQuestionChart, addComparisonChart } from "./charts";
import { supabase } from "@/integrations/supabase/client";

// Create title slide
export const createTitleSlide = (pptx: pptxgen, campaign: CampaignData) => {
  const slide = pptx.addSlide();
  Object.assign(slide, slideMasters.TITLE);

  // Main title
  slide.addText(campaign.name, {
    x: 1,
    y: 2.5,
    w: 8,
    h: 1.5,
    fontSize: 44,
    bold: true,
    color: THEME.text.primary,
    align: "center"
  });

  // Instance information if available
  if (campaign.instance) {
    slide.addText(`Period ${campaign.instance.period_number}`, {
      x: 1,
      y: 4,
      w: 8,
      h: 1,
      fontSize: 28,
      color: THEME.primary,
      align: "center"
    });
  }

  // Description if available
  if (campaign.description) {
    slide.addText(campaign.description, {
      x: 1,
      y: 4.8,
      w: 8,
      h: 1,
      fontSize: 20,
      color: THEME.text.secondary,
      align: "center"
    });
  }

  // Date range
  const startDate = campaign.instance?.starts_at || campaign.starts_at;
  const endDate = campaign.instance?.ends_at || campaign.ends_at;

  slide.addText(`${formatDate(startDate)} - ${formatDate(endDate)}`, {
    x: 1,
    y: 5.8,
    w: 8,
    h: 0.8,
    fontSize: 18,
    color: THEME.text.light,
    align: "center"
  });
};

// Create completion rate slide with proper status distribution data
export const createCompletionSlide = async (pptx: pptxgen, campaign: CampaignData, processedData: ProcessedData) => {
  const slide = pptx.addSlide();
  Object.assign(slide, slideMasters.CHART);

  slide.addText("Response Distribution", {
    x: 0.5,
    y: 0.5,
    fontSize: 32,
    bold: true,
    color: THEME.text.primary,
  });

  // Get actual status distribution data using the same RPC as overview tab
  let statusData = [];
  if (campaign.instance?.id) {
    try {
      const { data, error } = await supabase
        .rpc('get_campaign_instance_status_distribution', {
          p_campaign_id: campaign.id,
          p_instance_id: campaign.instance.id
        });

      if (!error && data) {
        // Ensure all status types have a value
        const defaultStatuses = ['submitted', 'in_progress', 'expired', 'assigned'];
        const statusMap = new Map(data.map(item => [item.status, item.count]));
        
        statusData = defaultStatuses.map(status => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: statusMap.get(status) || 0
        }));
      }
    } catch (error) {
      console.error("Error fetching status distribution:", error);
    }
  }

  // Fallback to processed data if RPC fails
  if (statusData.length === 0) {
    const totalResponses = processedData.responses.length;
    const submittedResponses = processedData.responses.filter(r => r.submitted_at).length;
    
    const completedPercentage = totalResponses > 0 ? (submittedResponses / totalResponses) * 100 : 0;
    const pendingPercentage = 100 - completedPercentage;

    statusData = [
      { name: "Submitted", value: submittedResponses },
      { name: "Pending", value: totalResponses - submittedResponses }
    ];
  }

  const data = [{
    name: "Response Status",
    labels: statusData.map(item => item.name),
    values: statusData.map(item => item.value)
  }];

  // Add pie chart
  slide.addChart(pptx.ChartType.pie, data, {
    x: 0.5,
    y: 1.5,
    w: 4.2,
    h: 3,
    chartColors: [THEME.primary, '#3B82F6', '#EF4444', '#F59E0B'],
    showLegend: true,
    legendPos: 'r',
    legendFontSize: 11,
    dataLabelFormatCode: '0"%"',
    dataLabelFontSize: 10,
    showValue: true,
  });

  // Add response statistics as text
  const total = statusData.reduce((sum, item) => sum + item.value, 0);
  
  const statsText = [
    { text: "Response Summary\n\n", options: { bold: true, fontSize: 14 } },
    { text: `Total: `, options: { bold: true } },
    { text: `${total}\n\n` }
  ];

  statusData.forEach(item => {
    const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
    statsText.push(
      { text: `${item.name}: `, options: { bold: true } },
      { text: `${item.value} (${percentage}%)\n` }
    );
  });

  slide.addText(statsText, {
    x: 5.2,
    y: 2,
    w: 4,
    fontSize: 12,
    color: THEME.text.primary,
  });
};

// Create question slides
export const createQuestionSlides = async (
  pptx: pptxgen, 
  campaign: CampaignData, 
  processedData: ProcessedData,
  onProgress?: (progress: number) => void
) => {
  // Filter out text and comment questions
  const filteredQuestions = processedData.questions.filter(
    question => question.type !== "text" && question.type !== "comment"
  );

  for (const question of filteredQuestions) {
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
    for (const dimension of ["sbu", "gender", "location", "employment_type", "level", "employee_type", "employee_role", "generation"]) {
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
    
    // Call the progress callback after each question's slides are created
    if (onProgress) {
      onProgress(1); // Pass a numeric value to indicate progress increment
    }
  }
};
