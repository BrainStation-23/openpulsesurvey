import pptxgen from "pptxgenjs";
import { THEME } from "../theme";
import { calculateMedian } from "./helpers/mediaCalculations";
import { processNpsData, processSatisfactionData } from "./helpers/dataProcessing";

export const addRatingChart = (
  slide: pptxgen.Slide,
  answers: number[],
  isNps: boolean
) => {
  const validAnswers = answers.filter(
    (rating) => typeof rating === "number"
  );
  
  if (isNps) {
    const { detractors, passives, promoters, total, npsScore } = processNpsData(validAnswers);

    slide.addText(`NPS Score: ${npsScore}`, {
      x: 0.5,
      y: 2.0,
      w: "90%",
      fontSize: 24,
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
      y: 2.8,
      w: 7,
      h: 1.5,
      barDir: "bar",
      chartColors: [THEME.chart.colors[1], THEME.chart.colors[2], THEME.chart.colors[0]],
      showLegend: true,
      legendPos: 'b',
      dataLabelFormatCode: '0"%"',
      barGrouping: "stacked"
    });
  } else {
    const median = calculateMedian(validAnswers);
    const average = validAnswers.reduce((a, b) => a + b, 0) / validAnswers.length;
    const { unsatisfied, neutral, satisfied, total, satisfactionRate } = processSatisfactionData(validAnswers);

    // Add metrics below question
    slide.addText([
      { text: "Satisfaction Rate: ", options: { bold: true } },
      { text: `${satisfactionRate}%`, options: { color: "#22c55e" } },
      { text: "    Median Score: ", options: { bold: true } },
      { text: `${median.toFixed(1)}`, options: { color: "#3b82f6" } },
      { text: "    Average Score: ", options: { bold: true } },
      { text: `${average.toFixed(1)}`, options: { color: "#8b5cf6" } },
    ], {
      x: 0.5,
      y: 2.0,
      w: "90%",
      fontSize: 16,
      color: THEME.text.primary,
    });

    const data = [
      {
        name: "Unsatisfied",
        labels: ["Distribution"],
        values: [(unsatisfied / total) * 100]
      },
      {
        name: "Neutral",
        labels: ["Distribution"],
        values: [(neutral / total) * 100]
      },
      {
        name: "Satisfied",
        labels: ["Distribution"],
        values: [(satisfied / total) * 100]
      }
    ];

    // Reduced chart height and adjusted position
    slide.addChart("bar", data, {
      x: 1,
      y: 2.8,
      w: 7,
      h: 1.5,
      barDir: "bar",
      chartColors: ["#ef4444", "#eab308", "#22c55e"],
      showLegend: true,
      legendPos: 'b',
      dataLabelFormatCode: '0"%"',
      barGrouping: "stacked"
    });

    // Adjusted position of response counts to be closer to the chart
    slide.addText([
      { text: "Total Responses: ", options: { bold: true } },
      { text: `${total}\n` },
      { text: "Unsatisfied: ", options: { bold: true, color: "#ef4444" } },
      { text: `${unsatisfied} (${Math.round((unsatisfied / total) * 100)}%)\n` },
      { text: "Neutral: ", options: { bold: true, color: "#eab308" } },
      { text: `${neutral} (${Math.round((neutral / total) * 100)}%)\n` },
      { text: "Satisfied: ", options: { bold: true, color: "#22c55e" } },
      { text: `${satisfied} (${Math.round((satisfied / total) * 100)}%)` },
    ], {
      x: 0.5,
      y: 4.5,
      w: "90%",
      fontSize: 12,
      color: THEME.text.primary,
    });
  }
};

export const addRatingComparison = (
  slide: pptxgen.Slide,
  groupedData: Map<string, any>,
  dimension: string,
  isNps: boolean
) => {
  const groups = Array.from(groupedData.keys());

  if (dimension === 'supervisor') {
    // Create a table for supervisor heatmap
    const tableData = groups.map(group => {
      const data = groupedData.get(group);
      const total = data.total;
      return [
        group,
        `${Math.round((data.unsatisfied / total) * 100)}%`,
        `${Math.round((data.neutral / total) * 100)}%`,
        `${Math.round((data.satisfied / total) * 100)}%`
      ];
    });

    // Add title for the heatmap
    slide.addText("Response Distribution by Supervisor", {
      x: 0.5,
      y: 1.5,
      fontSize: 14,
      bold: true,
      color: "363636"
    });

    // Add heatmap table
    slide.addTable([
      [{ text: "Supervisor", options: { bold: true } }, 
       { text: "Unsatisfied (1-2)", options: { bold: true } }, 
       { text: "Neutral (3)", options: { bold: true } }, 
       { text: "Satisfied (4-5)", options: { bold: true } }],
      ...tableData
    ], {
      x: 0.5,
      y: 2.0,
      w: 9,
      fill: { color: "F5F5F5" },
      border: { pt: 1, color: "E0E0E0" },
      colW: [3, 2, 2, 2],
      align: "center",
      fontSize: 11,
      color: "363636"
    });

    return;
  }

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
      w: 8,
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
    // Create data for satisfaction categories
    const unsatisfiedData = {
      name: "Unsatisfied",
      labels: groups,
      values: groups.map(group => {
        const answers = groupedData.get(group) || [];
        const validAnswers = answers.filter((a: number) => typeof a === "number");
        const unsatisfied = validAnswers.filter((r: number) => r <= 2).length;
        return (unsatisfied / validAnswers.length) * 100;
      })
    };

    const neutralData = {
      name: "Neutral",
      labels: groups,
      values: groups.map(group => {
        const answers = groupedData.get(group) || [];
        const validAnswers = answers.filter((a: number) => typeof a === "number");
        const neutral = validAnswers.filter((r: number) => r === 3).length;
        return (neutral / validAnswers.length) * 100;
      })
    };

    const satisfiedData = {
      name: "Satisfied",
      labels: groups,
      values: groups.map(group => {
        const answers = groupedData.get(group) || [];
        const validAnswers = answers.filter((a: number) => typeof a === "number");
        const satisfied = validAnswers.filter((r: number) => r >= 4).length;
        return (satisfied / validAnswers.length) * 100;
      })
    };

    // Adjusted comparison chart size and position
    slide.addChart("bar", [unsatisfiedData, neutralData, satisfiedData], {
      x: 0.5,
      y: 1.5,
      w: 8,
      h: 3.5,
      barDir: "col",
      barGrouping: "clustered",
      chartColors: ["#ef4444", "#eab308", "#22c55e"],
      showLegend: true,
      legendPos: 'b',
      dataLabelFormatCode: '0"%"',
      catAxisTitle: dimension,
      valAxisTitle: "Distribution (%)",
      valAxisMaxVal: 100,
    });
  }
};
