
import PptxGenJS from "https://esm.sh/pptxgenjs@3.12.0";
import { cleanText, formatDate, logError } from "./helpers.ts";
import { DEFAULT_THEME, DEFAULT_SLIDE_MASTERS } from "./theme.ts";
import { 
  fetchResponsesManually, 
  fetchBooleanResponses, 
  fetchNpsResponses, 
  fetchRatingResponses,
  getQuestionsByType
} from "./fetchResponses.ts";

export async function createTitleSlide(pptx: PptxGenJS, campaign: any) {
  try {
    console.log("Creating title slide...");
    const slide = pptx.addSlide();
    Object.assign(slide, DEFAULT_SLIDE_MASTERS.TITLE);

    slide.addText(campaign.name, {
      x: 0.5,
      y: 0.5,
      w: "90%",
      fontSize: 44,
      bold: true,
      color: DEFAULT_THEME.text.primary,
    });

    if (campaign.description) {
      slide.addText(campaign.description, {
        x: 0.5,
        y: 2,
        w: "90%",
        fontSize: 20,
        color: DEFAULT_THEME.text.secondary,
      });
    }

    // Safe access with fallbacks
    const startDate = campaign.instance?.starts_at || campaign.starts_at || 'N/A';
    const endDate = campaign.instance?.ends_at || campaign.ends_at || 'N/A';
    const completionRate = campaign.instance?.completion_rate ?? campaign.completion_rate ?? 0;

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
      color: DEFAULT_THEME.text.light,
    });
    
    console.log("Title slide created successfully");
  } catch (error) {
    logError("createTitleSlide", error);
    // Create a basic slide with error message
    const slide = pptx.addSlide();
    slide.addText("Error creating title slide", {
      x: 0.5,
      y: 0.5,
      fontSize: 24,
      color: DEFAULT_THEME.danger,
    });
  }
}

export function createCompletionSlide(pptx: PptxGenJS, campaign: any) {
  try {
    console.log("Creating completion rate slide...");
    const slide = pptx.addSlide();
    Object.assign(slide, DEFAULT_SLIDE_MASTERS.CHART);

    slide.addText("Response Distribution", {
      x: 0.5,
      y: 0.5,
      fontSize: 32,
      bold: true,
      color: DEFAULT_THEME.text.primary,
    });

    // Use completion rate with fallbacks
    const instanceCompletionRate = campaign.instance?.completion_rate || campaign.completion_rate || 0;
    const expiredRate = 0;
    const pendingRate = 100 - (instanceCompletionRate + expiredRate);

    const data = [{
      name: "Status Distribution",
      labels: ["Completed", "Expired", "Pending"],
      values: [instanceCompletionRate, expiredRate, pendingRate]
    }];

    slide.addChart(pptx.ChartType.pie, data, {
      x: 0.5,
      y: 1.5,
      w: 4.2,
      h: 3,
      chartColors: [DEFAULT_THEME.primary, DEFAULT_THEME.tertiary, DEFAULT_THEME.light],
      showLegend: true,
      legendPos: 'r',
      legendFontSize: 11,
      dataLabelFormatCode: '0"%"',
      dataLabelFontSize: 10,
      showValue: true,
    });

    slide.addText([
      { text: "Response Status\n\n", options: { bold: true, fontSize: 14 } },
      { text: `Completed: `, options: { bold: true } },
      { text: `${instanceCompletionRate.toFixed(1)}%\n` },
      { text: `Expired: `, options: { bold: true } },
      { text: `${expiredRate.toFixed(1)}%\n` },
      { text: `Pending: `, options: { bold: true } },
      { text: `${pendingRate.toFixed(1)}%` },
    ], {
      x: 5.2,
      y: 2,
      w: 4,
      fontSize: 12,
      color: DEFAULT_THEME.text.primary,
    });
    
    console.log("Completion rate slide created successfully");
  } catch (error) {
    logError("createCompletionSlide", error);
    // Create a basic slide with error message
    const slide = pptx.addSlide();
    slide.addText("Error creating completion rate slide", {
      x: 0.5,
      y: 0.5,
      fontSize: 24,
      color: DEFAULT_THEME.danger,
    });
  }
}

export async function createTrendsSlide(pptx: PptxGenJS, campaign: any, instanceId: string | null) {
  try {
    console.log("Creating trends slide...");
    const slide = pptx.addSlide();
    Object.assign(slide, DEFAULT_SLIDE_MASTERS.CHART);

    slide.addText("Response Trends", {
      x: 0.5,
      y: 0.5,
      fontSize: 32,
      bold: true,
      color: DEFAULT_THEME.text.primary,
    });

    // Get response timestamps
    console.log("Fetching response timestamps...");
    const responses = await fetchResponsesManually(campaign.id, instanceId, 'submitted_at');
    
    if (!responses || responses.length === 0) {
      console.log("No response trend data available");
      slide.addText("No response trend data available", {
        x: 0.5,
        y: 2,
        w: "90%",
        fontSize: 16,
        color: DEFAULT_THEME.text.secondary,
        italic: true,
      });
      return;
    }

    console.log(`Got ${responses.length} timestamps for trend analysis`);

    // Process response timestamps into daily counts
    const responsesByDay: Record<string, number> = {};
    let validDates = 0;
    
    responses.forEach(response => {
      if (!response) return;
      try {
        const date = new Date(response);
        if (isNaN(date.getTime())) {
          console.warn(`Invalid date: ${response}`);
          return;
        }
        
        const dateStr = date.toISOString().split('T')[0];
        responsesByDay[dateStr] = (responsesByDay[dateStr] || 0) + 1;
        validDates++;
      } catch (e) {
        console.error(`Error processing timestamp: ${response}`, e);
      }
    });

    console.log(`Processed ${validDates} valid dates out of ${responses.length} timestamps`);

    const sortedDates = Object.keys(responsesByDay).sort();
    
    if (sortedDates.length === 0) {
      console.log("No valid dates found for trends");
      slide.addText("No valid response trend data available", {
        x: 0.5,
        y: 2,
        w: "90%",
        fontSize: 16,
        color: DEFAULT_THEME.text.secondary,
        italic: true,
      });
      return;
    }

    console.log(`Processed ${sortedDates.length} days of responses`);

    const chartData = [{
      name: "Daily Responses",
      labels: sortedDates.map(date => {
        try {
          const [year, month, day] = date.split('-');
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return `${months[parseInt(month) - 1]} ${parseInt(day)}`;
        } catch (e) {
          console.error(`Error formatting date label: ${date}`, e);
          return date;
        }
      }),
      values: sortedDates.map(date => responsesByDay[date])
    }];

    slide.addChart(pptx.ChartType.bar, chartData, {
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 4,
      barDir: 'col',
      chartColors: [DEFAULT_THEME.primary],
      showValue: true,
      showLegend: false,
      dataLabelFontSize: 10,
      catAxisLabelFontSize: 10,
      valAxisLabelFontSize: 10,
      valAxisMaxVal: Math.max(...Object.values(responsesByDay)) * 1.2,
    });
    
    console.log("Trends slide created successfully");
  } catch (error) {
    logError("createTrendsSlide", error);
    const slide = pptx.addSlide();
    Object.assign(slide, DEFAULT_SLIDE_MASTERS.CHART);
    
    slide.addText("Response Trends", {
      x: 0.5,
      y: 0.5,
      fontSize: 32,
      bold: true,
      color: DEFAULT_THEME.text.primary,
    });
    
    slide.addText("Response trend data not available", {
      x: 0.5,
      y: 2,
      w: "90%",
      fontSize: 16,
      color: DEFAULT_THEME.text.secondary,
      italic: true,
    });
    
    console.log("Created fallback trends slide due to error");
  }
}

export async function createQuestionSlidesForPPTX(pptx: PptxGenJS, campaign: any, instanceId: string | null) {
  try {
    console.log("Creating question slides...");
    
    // Step 1: Get the survey data with questions
    if (!campaign.survey) {
      console.error("Survey data missing");
      return;
    }

    // Step 2-4: Categorize questions by type
    const { npsQuestions, satisfactionQuestions, booleanQuestions, textQuestions } = 
      getQuestionsByType(campaign.survey);
    
    console.log(`Found ${npsQuestions.length} NPS questions, ${satisfactionQuestions.length} satisfaction questions, ${booleanQuestions.length} boolean questions`);

    // Process NPS questions
    for (const question of npsQuestions) {
      try {
        console.log(`Processing NPS question: ${question.name}`);
        const slide = pptx.addSlide();
        Object.assign(slide, DEFAULT_SLIDE_MASTERS.CHART);
        
        slide.addText(cleanText(question.title), {
          x: 0.5,
          y: 0.5,
          w: "90%",
          fontSize: 20,
          bold: true,
          color: DEFAULT_THEME.text.primary,
        });
        
        const npsData = await fetchNpsResponses(campaign.id, instanceId, question.name);
        
        if (!npsData || npsData.total === 0) {
          slide.addText("No responses available for this question", {
            x: 0.5,
            y: 2,
            w: "90%",
            fontSize: 16,
            color: DEFAULT_THEME.text.secondary,
            italic: true,
          });
          continue;
        }

        // Add NPS score
        slide.addText(`NPS Score: ${npsData.nps_score.toFixed(1)}`, {
          x: 0.5,
          y: 1.2,
          w: "90%",
          fontSize: 24,
          bold: true,
          color: DEFAULT_THEME.primary,
        });
        
        // Add NPS breakdown chart
        const npsChartData = [{
          name: "NPS Breakdown",
          labels: ["Detractors (0-6)", "Passives (7-8)", "Promoters (9-10)"],
          values: [npsData.detractors, npsData.passives, npsData.promoters]
        }];

        slide.addChart(pptx.ChartType.pie, npsChartData, {
          x: 0.5,
          y: 1.8,
          w: 4.5,
          h: 3.5,
          chartColors: [DEFAULT_THEME.tertiary, DEFAULT_THEME.light, DEFAULT_THEME.primary],
          showLegend: true,
          legendPos: 'r',
          dataLabelFormatCode: '0"%"',
          showValue: true,
        });

        // Add NPS stats
        slide.addText([
          { text: "Response Breakdown\n\n", options: { bold: true, fontSize: 16 } },
          { text: "Detractors (0-6): ", options: { bold: true } },
          { text: `${npsData.detractors} (${((npsData.detractors / npsData.total) * 100).toFixed(1)}%)\n` },
          { text: "Passives (7-8): ", options: { bold: true } },
          { text: `${npsData.passives} (${((npsData.passives / npsData.total) * 100).toFixed(1)}%)\n` },
          { text: "Promoters (9-10): ", options: { bold: true } },
          { text: `${npsData.promoters} (${((npsData.promoters / npsData.total) * 100).toFixed(1)}%)\n` },
          { text: "Average Score: ", options: { bold: true } },
          { text: `${npsData.avg_score.toFixed(1)}/10` },
        ], {
          x: 5.5,
          y: 2.5,
          w: 4,
          fontSize: 12,
          color: DEFAULT_THEME.text.primary,
        });
        
        console.log(`NPS question slide created for: ${question.name}`);
      } catch (error) {
        logError(`Processing NPS question ${question.name}`, error);
        // Continue to next question
      }
    }
    
    // Process Satisfaction questions (1-5 rating)
    for (const question of satisfactionQuestions) {
      try {
        console.log(`Processing satisfaction question: ${question.name}`);
        const slide = pptx.addSlide();
        Object.assign(slide, DEFAULT_SLIDE_MASTERS.CHART);
        
        slide.addText(cleanText(question.title), {
          x: 0.5,
          y: 0.5,
          w: "90%",
          fontSize: 20,
          bold: true,
          color: DEFAULT_THEME.text.primary,
        });
        
        const ratingData = await fetchRatingResponses(campaign.id, instanceId, question.name);
        
        if (!ratingData || ratingData.total === 0) {
          slide.addText("No responses available for this question", {
            x: 0.5,
            y: 2,
            w: "90%",
            fontSize: 16,
            color: DEFAULT_THEME.text.secondary,
            italic: true,
          });
          continue;
        }
        
        // Add satisfaction breakdown chart
        const satisfactionChartData = [{
          name: "Satisfaction Breakdown",
          labels: ["Unsatisfied (1-2)", "Neutral (3)", "Satisfied (4-5)"],
          values: [ratingData.unsatisfied, ratingData.neutral, ratingData.satisfied]
        }];

        slide.addChart(pptx.ChartType.pie, satisfactionChartData, {
          x: 0.5,
          y: 1.8,
          w: 4.5,
          h: 3.5,
          chartColors: [DEFAULT_THEME.tertiary, DEFAULT_THEME.light, DEFAULT_THEME.primary],
          showLegend: true,
          legendPos: 'r',
          dataLabelFormatCode: '0"%"',
          showValue: true,
        });
        
        // Calculate satisfaction percentage
        let satisfactionPercentage = 0;
        if (ratingData.total > 0) {
          satisfactionPercentage = (ratingData.satisfied / ratingData.total) * 100;
        }
        
        // Add satisfaction stats
        slide.addText([
          { text: "Satisfaction Rate: ", options: { bold: true, fontSize: 16 } },
          { text: `${satisfactionPercentage.toFixed(1)}%\n\n`, options: { fontSize: 16 } },
          { text: "Unsatisfied (1-2): ", options: { bold: true } },
          { text: `${ratingData.unsatisfied} (${ratingData.total > 0 ? ((ratingData.unsatisfied / ratingData.total) * 100).toFixed(1) : '0'}%)\n` },
          { text: "Neutral (3): ", options: { bold: true } },
          { text: `${ratingData.neutral} (${ratingData.total > 0 ? ((ratingData.neutral / ratingData.total) * 100).toFixed(1) : '0'}%)\n` },
          { text: "Satisfied (4-5): ", options: { bold: true } },
          { text: `${ratingData.satisfied} (${ratingData.total > 0 ? ((ratingData.satisfied / ratingData.total) * 100).toFixed(1) : '0'}%)\n` },
          { text: "Median Score: ", options: { bold: true } },
          { text: `${ratingData.median.toFixed(1)}/5` },
        ], {
          x: 5.5,
          y: 2.5,
          w: 4,
          fontSize: 12,
          color: DEFAULT_THEME.text.primary,
        });
        
        console.log(`Satisfaction question slide created for: ${question.name}`);
      } catch (error) {
        logError(`Processing satisfaction question ${question.name}`, error);
        // Continue to next question
      }
    }
    
    // Process Boolean questions
    for (const question of booleanQuestions) {
      try {
        console.log(`Processing boolean question: ${question.name}`);
        const slide = pptx.addSlide();
        Object.assign(slide, DEFAULT_SLIDE_MASTERS.CHART);
        
        slide.addText(cleanText(question.title), {
          x: 0.5,
          y: 0.5,
          w: "90%",
          fontSize: 20,
          bold: true,
          color: DEFAULT_THEME.text.primary,
        });
        
        const boolData = await fetchBooleanResponses(campaign.id, instanceId, question.name);
        
        if (!boolData || (boolData.yes === 0 && boolData.no === 0)) {
          slide.addText("No responses available for this question", {
            x: 0.5,
            y: 2,
            w: "90%",
            fontSize: 16,
            color: DEFAULT_THEME.text.secondary,
            italic: true,
          });
          continue;
        }
        
        const total = boolData.yes + boolData.no;
        
        // Add boolean breakdown chart
        const boolChartData = [{
          name: "Response Breakdown",
          labels: ["Yes", "No"],
          values: [boolData.yes, boolData.no]
        }];

        slide.addChart(pptx.ChartType.pie, boolChartData, {
          x: 0.5,
          y: 1.8,
          w: 4.5,
          h: 3.5,
          chartColors: [DEFAULT_THEME.primary, DEFAULT_THEME.tertiary],
          showLegend: true,
          legendPos: 'r',
          dataLabelFormatCode: '0"%"',
          showValue: true,
        });
        
        // Add boolean stats
        slide.addText([
          { text: "Response Breakdown\n\n", options: { bold: true, fontSize: 16 } },
          { text: "Yes: ", options: { bold: true } },
          { text: `${boolData.yes} (${total > 0 ? ((boolData.yes / total) * 100).toFixed(1) : '0'}%)\n` },
          { text: "No: ", options: { bold: true } },
          { text: `${boolData.no} (${total > 0 ? ((boolData.no / total) * 100).toFixed(1) : '0'}%)\n` },
          { text: "Total Responses: ", options: { bold: true } },
          { text: `${total}` },
        ], {
          x: 5.5,
          y: 2.5,
          w: 4,
          fontSize: 12,
          color: DEFAULT_THEME.text.primary,
        });
        
        console.log(`Boolean question slide created for: ${question.name}`);
      } catch (error) {
        logError(`Processing boolean question ${question.name}`, error);
        // Continue to next question
      }
    }
    
    // Process Text questions (optional)
    for (const question of textQuestions.slice(0, 2)) { // Limit to first 2 text questions
      try {
        console.log(`Processing text question: ${question.name}`);
        const slide = pptx.addSlide();
        Object.assign(slide, DEFAULT_SLIDE_MASTERS.CONTENT);
        
        slide.addText(cleanText(question.title), {
          x: 0.5,
          y: 0.5,
          w: "90%",
          fontSize: 20,
          bold: true,
          color: DEFAULT_THEME.text.primary,
        });
        
        const textResponses = await fetchResponsesManually(campaign.id, instanceId, question.name);
        
        if (!textResponses || textResponses.length === 0) {
          slide.addText("No text responses available for this question", {
            x: 0.5,
            y: 2,
            w: "90%",
            fontSize: 16,
            color: DEFAULT_THEME.text.secondary,
            italic: true,
          });
          continue;
        }
        
        // Display sample text responses (limit to 5)
        const sampleResponses = textResponses
          .filter(r => typeof r === 'string' && r.trim() !== '')
          .slice(0, 5);
        
        if (sampleResponses.length === 0) {
          slide.addText("No valid text responses available", {
            x: 0.5,
            y: 2,
            w: "90%",
            fontSize: 16,
            color: DEFAULT_THEME.text.secondary,
            italic: true,
          });
          continue;
        }
        
        slide.addText("Sample Responses:", {
          x: 0.5,
          y: 1.2,
          w: "90%",
          fontSize: 16,
          bold: true,
          color: DEFAULT_THEME.text.primary,
        });
        
        let yPosition = 1.7;
        sampleResponses.forEach((response, index) => {
          slide.addText(`${index + 1}. ${cleanText(response)}`, {
            x: 0.7,
            y: yPosition,
            w: "90%",
            fontSize: 14,
            color: DEFAULT_THEME.text.secondary,
            bullet: true,
          });
          yPosition += 0.7; // Adjust spacing based on text length
        });
        
        slide.addText(`Total responses: ${textResponses.length}`, {
          x: 0.5,
          y: yPosition + 0.5,
          w: "90%",
          fontSize: 14,
          color: DEFAULT_THEME.text.light,
          italic: true,
        });
        
        console.log(`Text question slide created for: ${question.name}`);
      } catch (error) {
        logError(`Processing text question ${question.name}`, error);
        // Continue to next question
      }
    }
    
    console.log("All question slides created successfully");
  } catch (error) {
    logError("createQuestionSlidesForPPTX", error);
    // Create an error slide
    const slide = pptx.addSlide();
    slide.addText("Error creating question slides", {
      x: 0.5,
      y: 0.5,
      fontSize: 24,
      color: DEFAULT_THEME.danger,
    });
  }
}
