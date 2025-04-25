
import pptxgen from "pptxgenjs";
import { CampaignData } from "../../types";
import { QuestionResponseData, PptxExportConfig } from "./types";
import { formatDate, cleanText } from "../../utils/pptx/helpers";

/**
 * Creates the title slide for the presentation
 */
export const createTitleSlide = (
  pptx: pptxgen, 
  campaign: CampaignData,
  theme: PptxExportConfig["theme"]
) => {
  const slide = pptx.addSlide();
  slide.background = { color: "FFFFFF" };
  slide.margin = [0.5, 0.5, 0.5, 0.5];

  slide.addText(campaign.name, {
    x: 0.5,
    y: 0.5,
    w: "90%",
    fontSize: 44,
    bold: true,
    color: theme.dark,
  });

  if (campaign.description) {
    slide.addText(campaign.description, {
      x: 0.5,
      y: 2,
      w: "90%",
      fontSize: 20,
      color: theme.secondary,
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
    color: theme.tertiary,
  });
};

/**
 * Creates the completion rate slide
 */
export const createCompletionSlide = (
  pptx: pptxgen, 
  campaign: CampaignData,
  theme: PptxExportConfig["theme"]
) => {
  const slide = pptx.addSlide();
  slide.background = { color: "FFFFFF" };
  slide.margin = [0.5, 1, 0.5, 0.5];

  slide.addText("Response Distribution", {
    x: 0.5,
    y: 0.5,
    fontSize: 32,
    bold: true,
    color: theme.dark,
  });

  // Calculate instance status distribution
  const instanceCompletionRate = campaign.instance?.completion_rate || 0;
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
    color: theme.dark,
  });
};

/**
 * Creates the trends slide
 */
export const createTrendsSlide = (
  pptx: pptxgen, 
  campaign: CampaignData,
  theme: PptxExportConfig["theme"]
) => {
  const slide = pptx.addSlide();
  slide.background = { color: "FFFFFF" };
  slide.margin = [0.5, 1, 0.5, 0.5];

  slide.addText("Response Trends", {
    x: 0.5,
    y: 0.5,
    fontSize: 32,
    bold: true,
    color: theme.dark,
  });

  slide.addText("Response trends will be shown here when historical data is available.", {
    x: 0.5,
    y: 2.5,
    w: "90%",
    fontSize: 16,
    color: theme.secondary,
    align: "center",
  });
};

/**
 * Creates slides for Boolean type questions
 */
export const createBooleanQuestionSlide = (
  pptx: pptxgen,
  questionData: QuestionResponseData,
  theme: PptxExportConfig["theme"]
) => {
  const { questionData: question, mainData, dimensionData } = questionData;
  
  // Create main question slide
  const slide = pptx.addSlide();
  slide.background = { color: "FFFFFF" };
  slide.margin = [0.5, 1, 0.5, 0.5];

  slide.addText(cleanText(question.title), {
    x: 0.5,
    y: 0.5,
    w: "90%",
    fontSize: 28,
    bold: true,
    color: theme.dark,
    wrap: true,
  });

  // If we have main data, create the pie chart
  if (mainData && mainData.length > 0) {
    const data = mainData[0];
    
    const chartData = [{
      name: "Response Distribution",
      labels: ["Yes", "No"],
      values: [data.yes_count, data.no_count]
    }];

    slide.addChart(pptx.ChartType.pie, chartData, {
      x: 1.5,
      y: 1.8,
      w: 6,
      h: 4.5,
      chartColors: [theme.primary, theme.light],
      showLegend: true,
      legendPos: 'b',
      showValue: true,
      dataLabelFormatCode: '#,##0',
    });
    
    // Add summary text below the chart
    const totalResponses = data.yes_count + data.no_count;
    const yesPercentage = totalResponses > 0 ? (data.yes_count / totalResponses) * 100 : 0;
    const noPercentage = totalResponses > 0 ? (data.no_count / totalResponses) * 100 : 0;
    
    slide.addText([
      { text: "Results Summary\n\n", options: { bold: true, fontSize: 14 } },
      { text: `Yes: `, options: { bold: true } },
      { text: `${data.yes_count} (${yesPercentage.toFixed(1)}%)\n` },
      { text: `No: `, options: { bold: true } },
      { text: `${data.no_count} (${noPercentage.toFixed(1)}%)\n` },
      { text: `Total Responses: `, options: { bold: true } },
      { text: `${totalResponses}` },
    ], {
      x: 3,
      y: 6.5,
      w: 4,
      align: 'center',
      fontSize: 12,
      color: theme.dark,
    });
  }

  // Create dimension comparison slides
  for (const dimension in dimensionData) {
    if (dimensionData[dimension] && dimensionData[dimension].length > 0) {
      const dimensionSlide = pptx.addSlide();
      dimensionSlide.background = { color: "FFFFFF" };
      dimensionSlide.margin = [0.5, 1, 0.5, 0.5];

      dimensionSlide.addText(cleanText(question.title), {
        x: 0.5,
        y: 0.5,
        w: "90%",
        fontSize: 24,
        bold: true,
        color: theme.dark,
        wrap: true,
      });

      dimensionSlide.addText(`Responses by ${dimension}`, {
        x: 0.5,
        y: 1.2,
        fontSize: 20,
        color: theme.secondary,
      });

      // Prepare data for a grouped bar chart
      const dimensionValues = dimensionData[dimension];
      const labels = dimensionValues.map(d => d.dimension.substring(0, 25)); // Truncate long names
      const yesValues = dimensionValues.map(d => d.yes_count);
      const noValues = dimensionValues.map(d => d.no_count);

      // If we have too many dimensions, use a table instead
      if (labels.length > 10) {
        // Add a table for the data
        const tableData = [
          ["Dimension", "Yes", "No", "Total", "Yes %"],
          ...dimensionValues.map(d => {
            const total = d.yes_count + d.no_count;
            const yesPercent = total > 0 ? (d.yes_count / total) * 100 : 0;
            return [
              d.dimension.substring(0, 30),
              d.yes_count.toString(),
              d.no_count.toString(),
              total.toString(),
              `${yesPercent.toFixed(1)}%`
            ];
          })
        ];

        dimensionSlide.addTable(tableData, {
          x: 0.5,
          y: 1.8,
          w: 9,
          h: 5,
          rowH: 0.3,
          colW: [3.5, 1.5, 1.5, 1.5, 1],
          border: { pt: 1, color: theme.light },
          bold: { rows: [0] },
          fontSize: 10,
        });
      } else {
        // Create a grouped bar chart for the comparison
        dimensionSlide.addChart(pptx.ChartType.bar, [
          {
            name: "Yes",
            labels,
            values: yesValues,
          },
          {
            name: "No",
            labels,
            values: noValues,
          }
        ], {
          x: 0.5,
          y: 1.8,
          w: 9,
          h: 5,
          chartColors: [theme.primary, theme.light],
          barDir: "bar",
          barGrouping: "stacked",
          dataLabelFormatCode: "#,##0",
          showValue: true,
          showLegend: true,
          legendPos: "b",
        });
      }
    }
  }
};

/**
 * Creates slides for Rating type questions (including NPS)
 */
export const createRatingQuestionSlide = (
  pptx: pptxgen,
  questionData: QuestionResponseData,
  theme: PptxExportConfig["theme"]
) => {
  const { questionData: question, mainData, dimensionData } = questionData;
  const isNps = question.rateCount === 10;
  
  // Create main question slide
  const slide = pptx.addSlide();
  slide.background = { color: "FFFFFF" };
  slide.margin = [0.5, 1, 0.5, 0.5];

  slide.addText(cleanText(question.title), {
    x: 0.5,
    y: 0.5,
    w: "90%",
    fontSize: 28,
    bold: true,
    color: theme.dark,
    wrap: true,
  });

  // If we have main data, create the appropriate chart
  if (mainData && mainData.length > 0) {
    const data = mainData[0];
    
    if (isNps) {
      // NPS chart with 3 segments
      const chartData = [{
        name: "NPS Distribution",
        labels: ["Detractors (0-6)", "Passives (7-8)", "Promoters (9-10)"],
        values: [data.detractors, data.passives, data.promoters]
      }];

      slide.addChart(pptx.ChartType.pie, chartData, {
        x: 1.5,
        y: 1.8,
        w: 6,
        h: 4.5,
        chartColors: [theme.danger, theme.light, theme.primary],
        showLegend: true,
        legendPos: 'b',
        showValue: true,
        dataLabelFormatCode: '#,##0',
      });
      
      // Add NPS score and summary below
      slide.addText([
        { text: "NPS Score: ", options: { bold: true, fontSize: 16 } },
        { text: `${data.nps_score.toFixed(1)}`, options: { fontSize: 16 } },
        { text: "\n\nAverage Score: ", options: { bold: true } },
        { text: `${data.avg_score.toFixed(1)} / 10\n` },
        { text: `Detractors: `, options: { bold: true } },
        { text: `${data.detractors} (${(data.detractors / data.total * 100).toFixed(1)}%)\n` },
        { text: `Passives: `, options: { bold: true } },
        { text: `${data.passives} (${(data.passives / data.total * 100).toFixed(1)}%)\n` },
        { text: `Promoters: `, options: { bold: true } },
        { text: `${data.promoters} (${(data.promoters / data.total * 100).toFixed(1)}%)\n` },
        { text: `Total Responses: `, options: { bold: true } },
        { text: `${data.total}` },
      ], {
        x: 3,
        y: 6.5,
        w: 4,
        align: 'center',
        fontSize: 12,
        color: theme.dark,
      });
    } else {
      // Regular satisfaction rating
      const chartData = [{
        name: "Rating Distribution",
        labels: ["Unsatisfied (1-2)", "Neutral (3)", "Satisfied (4-5)"],
        values: [data.unsatisfied, data.neutral, data.satisfied]
      }];

      slide.addChart(pptx.ChartType.pie, chartData, {
        x: 1.5,
        y: 1.8,
        w: 6,
        h: 4.5,
        chartColors: [theme.danger, theme.light, theme.primary],
        showLegend: true,
        legendPos: 'b',
        showValue: true,
        dataLabelFormatCode: '#,##0',
      });
      
      // Add average score and summary
      slide.addText([
        { text: "Average Score: ", options: { bold: true, fontSize: 16 } },
        { text: `${data.avg_score.toFixed(1)} / 5`, options: { fontSize: 16 } },
        { text: "\n\nUnsatisfied: ", options: { bold: true } },
        { text: `${data.unsatisfied} (${(data.unsatisfied / data.total * 100).toFixed(1)}%)\n` },
        { text: `Neutral: `, options: { bold: true } },
        { text: `${data.neutral} (${(data.neutral / data.total * 100).toFixed(1)}%)\n` },
        { text: `Satisfied: `, options: { bold: true } },
        { text: `${data.satisfied} (${(data.satisfied / data.total * 100).toFixed(1)}%)\n` },
        { text: `Total Responses: `, options: { bold: true } },
        { text: `${data.total}` },
      ], {
        x: 3,
        y: 6.5,
        w: 4,
        align: 'center',
        fontSize: 12,
        color: theme.dark,
      });
    }
  }

  // Create dimension comparison slides
  for (const dimension in dimensionData) {
    if (dimensionData[dimension] && dimensionData[dimension].length > 0) {
      const dimensionSlide = pptx.addSlide();
      dimensionSlide.background = { color: "FFFFFF" };
      dimensionSlide.margin = [0.5, 1, 0.5, 0.5];

      dimensionSlide.addText(cleanText(question.title), {
        x: 0.5,
        y: 0.5,
        w: "90%",
        fontSize: 24,
        bold: true,
        color: theme.dark,
        wrap: true,
      });

      dimensionSlide.addText(`Responses by ${dimension}`, {
        x: 0.5,
        y: 1.2,
        fontSize: 20,
        color: theme.secondary,
      });

      // Prepare data for the chart based on question type
      const dimensionValues = dimensionData[dimension];
      const labels = dimensionValues.map(d => d.dimension.substring(0, 25)); // Truncate long names

      // If we have too many dimensions, use a table instead
      if (labels.length > 10) {
        // Add a table for the data
        if (isNps) {
          const tableData = [
            ["Dimension", "NPS Score", "Avg. Score", "Detractors", "Passives", "Promoters", "Total"],
            ...dimensionValues.map(d => [
              d.dimension.substring(0, 25),
              d.nps_score.toFixed(1),
              d.avg_score.toFixed(1),
              d.detractors.toString(),
              d.passives.toString(),
              d.promoters.toString(),
              d.total.toString()
            ])
          ];

          dimensionSlide.addTable(tableData, {
            x: 0.5,
            y: 1.8,
            w: 9,
            h: 5,
            rowH: 0.3,
            colW: [2.5, 1, 1, 1, 1, 1, 1],
            border: { pt: 1, color: theme.light },
            bold: { rows: [0] },
            fontSize: 10,
          });
        } else {
          const tableData = [
            ["Dimension", "Avg. Score", "Unsatisfied", "Neutral", "Satisfied", "Total"],
            ...dimensionValues.map(d => [
              d.dimension.substring(0, 25),
              d.avg_score.toFixed(1),
              d.unsatisfied.toString(),
              d.neutral.toString(),
              d.satisfied.toString(),
              d.total.toString()
            ])
          ];

          dimensionSlide.addTable(tableData, {
            x: 0.5,
            y: 1.8,
            w: 9,
            h: 5,
            rowH: 0.3,
            colW: [3, 1.5, 1.5, 1, 1, 1],
            border: { pt: 1, color: theme.light },
            bold: { rows: [0] },
            fontSize: 10,
          });
        }
      } else {
        // Create a bar chart showing avg scores by dimension
        if (isNps) {
          dimensionSlide.addChart(pptx.ChartType.bar, [{
            name: "NPS Score",
            labels,
            values: dimensionValues.map(d => d.nps_score),
          }], {
            x: 0.5,
            y: 1.8,
            w: 9,
            h: 5,
            chartColors: [theme.primary],
            barDir: "bar",
            dataLabelFormatCode: "0.0",
            showValue: true,
            showLegend: false,
            chartAxisHidden: false,
          });
        } else {
          dimensionSlide.addChart(pptx.ChartType.bar, [{
            name: "Average Score",
            labels,
            values: dimensionValues.map(d => d.avg_score),
          }], {
            x: 0.5,
            y: 1.8,
            w: 9,
            h: 5,
            chartColors: [theme.primary],
            barDir: "bar",
            dataLabelFormatCode: "0.0",
            showValue: true,
            showLegend: false,
            chartAxisHidden: false,
          });
        }
      }
    }
  }
};

/**
 * Creates all question slides based on their types
 */
export const createQuestionSlides = (
  pptx: pptxgen,
  questionsData: QuestionResponseData[],
  theme: PptxExportConfig["theme"]
) => {
  for (const questionData of questionsData) {
    const { questionData: question } = questionData;
    
    if (question.type === "boolean") {
      createBooleanQuestionSlide(pptx, questionData, theme);
    } else if (question.type === "rating") {
      createRatingQuestionSlide(pptx, questionData, theme);
    }
    // Additional question types can be added here
  }
};
