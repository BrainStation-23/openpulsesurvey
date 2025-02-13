
import pptxgen from "pptxgenjs";
import { THEME } from "../theme";

export const addRatingChart = (
  slide: pptxgen.Slide,
  answers: number[],
  isNps: boolean
) => {
  const validAnswers = answers.filter(
    (rating) => typeof rating === "number"
  );
  
  if (isNps) {
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
    const data = [
      {
        name: "Detractors",
        labels: ["Distribution"],
        values: [(detractors / total) * 100]
      },
      {
        name: "Passives",
        labels: ["Distribution"],
        values: [(passives / total) * 100]
      },
      {
        name: "Promoters",
        labels: ["Distribution"],
        values: [(promoters / total) * 100]
      }
    ];

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
    const data = Array.from({ length: 5 }, (_, i) => {
      const labels: string[] = [`${i + 1} Star`];
      return {
        name: `${i + 1} Star`,
        labels,
        values: [validAnswers.filter(r => r === i + 1).length]
      };
    });

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
};

export const addRatingComparison = (
  slide: pptxgen.Slide,
  groupedData: Map<string, number[]>,
  dimension: string,
  isNps: boolean
) => {
  if (isNps) {
    const chartData = Array.from(groupedData.entries()).map(([group, answers]) => {
      const validAnswers = answers.filter((a: number) => typeof a === "number");
      const detractors = validAnswers.filter((r: number) => r <= 6).length;
      const promoters = validAnswers.filter((r: number) => r > 8).length;
      const total = validAnswers.length;
      const npsScore = ((promoters - detractors) / total) * 100;
      const labels: string[] = [group];

      return {
        name: group,
        labels,
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
    const chartData = Array.from(groupedData.entries()).map(([group, answers]) => {
      const validAnswers = answers.filter((a: number) => typeof a === "number");
      const average = validAnswers.reduce((a: number, b: number) => a + b, 0) / validAnswers.length;
      const labels: string[] = [group];

      return {
        name: group,
        labels,
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
};
