
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
    const detractors = validAnswers.filter(r => r <= 6).length;
    const passives = validAnswers.filter(r => r > 6 && r <= 8).length;
    const promoters = validAnswers.filter(r => r > 8).length;
    const total = validAnswers.length;

    const npsScore = Math.round(
      ((promoters - detractors) / total) * 100
    );

    slide.addText(`NPS Score: ${npsScore}`, {
      x: 0.5,
      y: 1.5,
      w: "90%",
      fontSize: 28,
      bold: true,
      color: npsScore >= 0 ? THEME.chart.colors[0] : THEME.chart.colors[1],
    });

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

    slide.addChart("bar", data, {
      x: 1,
      y: 2.5,
      w: 8,
      h: 3,
      barDir: "bar",
      chartColors: [THEME.chart.colors[1], THEME.chart.colors[2], THEME.chart.colors[0]],
      showLegend: true,
      legendPos: 'b',
      dataLabelFormatCode: '0"%"',
      barGrouping: "stacked"
    });
  } else {
    const data = Array.from({ length: 5 }, (_, i) => {
      const labels: string[] = [`${i + 1} Star`];
      return {
        name: `${i + 1} Star`,
        labels,
        values: [validAnswers.filter(r => r === i + 1).length]
      };
    });

    slide.addChart("bar", data, {
      x: 1,
      y: 1.5,
      w: 8,
      h: 3.5,
      barDir: "col",
      chartColors: data.map((_, index) => THEME.chart.colors[index % THEME.chart.colors.length]),
      showLegend: false,
      dataLabelFormatCode: '0',
      catAxisTitle: "Rating",
      valAxisTitle: "Number of Responses",
    });

    const average = validAnswers.reduce((a, b) => a + b, 0) / validAnswers.length;
    slide.addText(`Average Rating: ${average.toFixed(1)}`, {
      x: 0.5,
      y: 5.8,
      w: "90%",
      fontSize: 12,
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
  const groups = Array.from(groupedData.keys());

  if (isNps) {
    // Create data for detractors, passives, and promoters
    const detractorsData = {
      name: "Detractors",
      labels: groups,
      values: groups.map(group => {
        const answers = groupedData.get(group) || [];
        const validAnswers = answers.filter((a: number) => typeof a === "number");
        const detractors = validAnswers.filter((r: number) => r <= 6).length;
        return (detractors / validAnswers.length) * 100;
      })
    };

    const passivesData = {
      name: "Passives",
      labels: groups,
      values: groups.map(group => {
        const answers = groupedData.get(group) || [];
        const validAnswers = answers.filter((a: number) => typeof a === "number");
        const passives = validAnswers.filter((r: number) => r > 6 && r <= 8).length;
        return (passives / validAnswers.length) * 100;
      })
    };

    const promotersData = {
      name: "Promoters",
      labels: groups,
      values: groups.map(group => {
        const answers = groupedData.get(group) || [];
        const validAnswers = answers.filter((a: number) => typeof a === "number");
        const promoters = validAnswers.filter((r: number) => r > 8).length;
        return (promoters / validAnswers.length) * 100;
      })
    };

    slide.addChart("bar", [detractorsData, passivesData, promotersData], {
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 4,
      barDir: "col",
      barGrouping: "clustered",
      chartColors: [THEME.chart.colors[1], THEME.chart.colors[2], THEME.chart.colors[0]],
      showLegend: true,
      legendPos: 'b',
      dataLabelFormatCode: '0"%"',
      catAxisTitle: dimension,
      valAxisTitle: "Distribution (%)",
      valAxisMaxVal: 100,
    });
  } else {
    // Create data for each rating (1-5)
    const ratingData = Array.from({ length: 5 }, (_, rating) => ({
      name: `${rating + 1} Star`,
      labels: groups,
      values: groups.map(group => {
        const answers = groupedData.get(group) || [];
        const validAnswers = answers.filter((a: number) => typeof a === "number");
        return validAnswers.filter((r: number) => r === rating + 1).length;
      })
    }));

    slide.addChart("bar", ratingData, {
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 4,
      barDir: "col",
      barGrouping: "clustered",
      chartColors: ratingData.map((_, index) => THEME.chart.colors[index % THEME.chart.colors.length]),
      showLegend: true,
      legendPos: 'b',
      dataLabelFormatCode: '0',
      catAxisTitle: dimension,
      valAxisTitle: "Number of Responses",
    });
  }
};
