
import pptxgen from "pptxgenjs";
import { THEME } from "../theme";

export const addBooleanChart = (
  slide: pptxgen.Slide,
  answers: any[],
) => {
  const trueCount = answers.filter(a => a === true).length;
  const falseCount = answers.filter(a => a === false).length;
  const total = trueCount + falseCount;

  const labels: string[] = ["Yes", "No"];
  const data = [{
    name: "Responses",
    labels,
    values: [trueCount, falseCount]
  }];

  // Reduced size and centered positioning
  slide.addChart("doughnut", data, {
    x: 2,
    y: 1.5,
    w: 6,
    h: 4,
    chartColors: [THEME.primary, THEME.secondary], // Using distinct colors
    showLegend: true,
    legendPos: 'b',
    dataLabelFormatCode: '0"%"',
    title: "Response Distribution"
  });

  slide.addText([
    { text: "Total Responses: ", options: { bold: true } },
    { text: `${total}` },
    { text: "\nYes: ", options: { bold: true, color: THEME.primary } },
    { text: `${trueCount} (${Math.round((trueCount / total) * 100)}%)` },
    { text: "\nNo: ", options: { bold: true, color: THEME.secondary } },
    { text: `${falseCount} (${Math.round((falseCount / total) * 100)}%)` },
  ], {
    x: 0.5,
    y: 5.8,
    w: "90%",
    fontSize: 12,
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

  // Reduced size for comparison charts
  slide.addChart("bar", chartData, {
    x: 1,
    y: 2,
    w: 8,
    h: 3.5,
    barDir: "col",
    chartColors: [THEME.chart.colors[0], THEME.chart.colors[1], THEME.chart.colors[2], THEME.chart.colors[3]],
    showLegend: false,
    dataLabelFormatCode: '0"%"',
    catAxisTitle: dimension,
    valAxisTitle: "Percentage Responding Yes",
  });
};
