
import pptxgen from "pptxgenjs";
import { ProcessedData } from "../../../types/responses";
import { THEME } from "../theme";

export const addBooleanChart = (
  slide: pptxgen.Slide,
  answers: any[],
) => {
  const trueCount = answers.filter(a => a === true).length;
  const falseCount = answers.filter(a => a === false).length;
  const total = trueCount + falseCount;

  // Ensure labels are explicitly typed as string array
  const labels: string[] = ["Yes", "No"];
  const data = [{
    name: "Responses",
    labels,
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
};

export const addBooleanComparison = (
  slide: pptxgen.Slide,
  groupedData: Map<string, any[]>,
  dimension: string
) => {
  const chartData = Array.from(groupedData.entries()).map(([group, answers]) => {
    const trueCount = answers.filter((a: boolean) => a === true).length;
    const total = answers.length;
    const labels: string[] = [group];
    return {
      name: group,
      labels,
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
};
