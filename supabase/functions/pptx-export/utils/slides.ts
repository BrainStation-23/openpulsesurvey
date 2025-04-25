
import PptxGenJS from "https://esm.sh/pptxgenjs@3.12.0";
import { cleanText, formatDate } from "./helpers.ts";
import { DEFAULT_THEME, DEFAULT_SLIDE_MASTERS } from "./theme.ts";
import { fetchResponsesManually } from "./fetchResponses.ts";

export async function createTitleSlide(pptx: PptxGenJS, campaign: any) {
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
    color: DEFAULT_THEME.text.light,
  });
}

export function createCompletionSlide(pptx: PptxGenJS, campaign: any) {
  const slide = pptx.addSlide();
  Object.assign(slide, DEFAULT_SLIDE_MASTERS.CHART);

  slide.addText("Response Distribution", {
    x: 0.5,
    y: 0.5,
    fontSize: 32,
    bold: true,
    color: DEFAULT_THEME.text.primary,
  });

  const instanceCompletionRate = campaign.instance?.completion_rate || 0;
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
}

export async function createTrendsSlide(pptx: PptxGenJS, campaign: any, instanceId: string | null) {
  const slide = pptx.addSlide();
  Object.assign(slide, DEFAULT_SLIDE_MASTERS.CHART);

  slide.addText("Response Trends", {
    x: 0.5,
    y: 0.5,
    fontSize: 32,
    bold: true,
    color: DEFAULT_THEME.text.primary,
  });

  try {
    const responses = await fetchResponsesManually(campaign.id, instanceId, 'submitted_at');
    
    if (!responses || responses.length === 0) {
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

    const responsesByDay: Record<string, number> = {};
    responses.forEach(response => {
      const date = new Date(response);
      const dateStr = date.toISOString().split('T')[0];
      responsesByDay[dateStr] = (responsesByDay[dateStr] || 0) + 1;
    });

    const chartData = [{
      name: "Daily Responses",
      labels: Object.keys(responsesByDay).map(date => {
        const [year, month, day] = date.split('-');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[parseInt(month) - 1]} ${parseInt(day)}`;
      }),
      values: Object.values(responsesByDay)
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
  } catch (error) {
    console.error("Error creating trends slide:", error);
    slide.addText("Response trend data not available", {
      x: 0.5,
      y: 2,
      w: "90%",
      fontSize: 16,
      color: DEFAULT_THEME.text.secondary,
      italic: true,
    });
  }
}

