
import pptxgen from "pptxgenjs";
import { THEME } from "../theme";

/**
 * Adds boolean chart to the slide
 */
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

  slide.addChart("doughnut", data, {
    x: 2,
    y: 2.5,
    w: 4,
    h: 2,
    chartColors: [THEME.chart.colors[0], THEME.chart.colors[1]],
    showLegend: true,
    legendPos: 'b',
    dataLabelFormatCode: '0"%"',
    title: "Response Distribution"
  });

  slide.addText([
    { text: "Total Responses: ", options: { bold: true } },
    { text: `${total}` },
    { text: "\nYes: ", options: { bold: true, color: THEME.chart.colors[0] } },
    { text: `${trueCount} (${Math.round((trueCount / total) * 100)}%)` },
    { text: "\nNo: ", options: { bold: true, color: THEME.chart.colors[1] } },
    { text: `${falseCount} (${Math.round((falseCount / total) * 100)}%)` },
  ], {
    x: 0.5,
    y: 4.8,
    w: "90%",
    fontSize: 12,
    color: THEME.text.primary,
  });
};

/**
 * Adds boolean comparison chart to the slide
 */
export const addBooleanComparison = (
  slide: pptxgen.Slide,
  groupedData: Map<string, any[]>,
  dimension: string
) => {
  // Extract unique group names
  const groups = Array.from(groupedData.keys());
  
  // Calculate percentages for Yes and No for each group
  const yesData = {
    name: "Yes",
    labels: groups,
    values: groups.map(group => {
      const answers = groupedData.get(group) || [];
      const trueCount = answers.filter((a: boolean) => a === true).length;
      return (trueCount / answers.length) * 100;
    })
  };

  const noData = {
    name: "No",
    labels: groups,
    values: groups.map(group => {
      const answers = groupedData.get(group) || [];
      const falseCount = answers.filter((a: boolean) => a === false).length;
      return (falseCount / answers.length) * 100;
    })
  };

  slide.addChart("bar", [yesData, noData], {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 4,
    barDir: "col",
    barGrouping: "clustered",
    chartColors: [THEME.chart.colors[0], THEME.chart.colors[1]],
    showLegend: true,
    legendPos: 'b',
    dataLabelFormatCode: '0"%"',
    catAxisTitle: dimension,
    valAxisTitle: "Response Distribution (%)",
    valAxisMaxVal: 100,
  });
};
