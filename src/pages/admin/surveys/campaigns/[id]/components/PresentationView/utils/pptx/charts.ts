import pptxgen from "pptxgenjs";
import { ProcessedData } from "../../types/responses";
import { THEME } from "./theme";

// Helper to add appropriate chart for question type
export const addQuestionChart = async (
  slide: pptxgen.Slide,
  question: any,
  processedData: ProcessedData
) => {
  const answers = processedData.responses
    .filter(r => r.answers[question.name]?.answer !== undefined)
    .map(r => r.answers[question.name].answer);

  switch (question.type) {
    case "boolean": {
      const trueCount = answers.filter(a => a === true).length;
      const falseCount = answers.filter(a => a === false).length;
      const total = trueCount + falseCount;

      const data = [{
        name: "Responses",
        labels: ["Yes", "No"] as string[],
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
      break;
    }

    case "rating": {
      const validAnswers = answers.filter(
        (rating) => typeof rating === "number"
      );
      
      if (question.rateCount === 10) {
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
        const data = [{
          name: "Distribution",
          labels: ["Detractors", "Passives", "Promoters"],
          values: [
            (detractors / total) * 100,
            (passives / total) * 100,
            (promoters / total) * 100
          ]
        }];

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
        const data = Array.from({ length: 5 }, (_, i) => ({
          name: `${i + 1} Star`,
          labels: [`${i + 1} Star`],
          values: [validAnswers.filter(r => r === i + 1).length]
        }));

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
      break;
    }

    case "text":
    case "comment": {
      // Create word frequency analysis
      const wordFrequency: Record<string, number> = {};
      answers.forEach((answer) => {
        if (typeof answer === "string") {
          const words = answer
            .toLowerCase()
            .replace(/[^\w\s]/g, "")
            .split(/\s+/)
            .filter((word) => word.length > 2);

          words.forEach((word) => {
            wordFrequency[word] = (wordFrequency[word] || 0) + 1;
          });
        }
      });

      // Convert to array and sort by frequency
      const topWords = Object.entries(wordFrequency)
        .map(([text, value]) => ({
          name: text,
          labels: [text], // Added labels property as string array
          values: [value]
        }))
        .sort((a, b) => b.values[0] - a.values[0])
        .slice(0, 10);

      // Add bar chart for top words
      slide.addChart(pptxgen.ChartType.bar, topWords, {
        x: 0.5,
        y: 1.5,
        w: 9,
        h: 4,
        barDir: "col",
        chartColors: [THEME.chart.colors[0]],
        showLegend: false,
        dataLabelFormatCode: '0',
        catAxisTitle: "Words",
        valAxisTitle: "Frequency",
      });

      // Add total responses info
      slide.addText([
        { text: "Total Responses: ", options: { bold: true } },
        { text: `${answers.length}` },
        { text: "\nUnique Words: ", options: { bold: true } },
        { text: `${Object.keys(wordFrequency).length}` },
      ], {
        x: 0.5,
        y: 6,
        w: "90%",
        fontSize: 14,
        color: THEME.text.primary,
      });
      break;
    }
  }
};

// Helper to add comparison chart
export const addComparisonChart = async (
  slide: pptxgen.Slide,
  question: any,
  processedData: ProcessedData,
  dimension: string
) => {
  const groupedData = new Map();

  // Group responses by dimension
  processedData.responses.forEach((response) => {
    const answer = response.answers[question.name]?.answer;
    if (answer === undefined) return;

    let groupKey = "Unknown";
    switch (dimension) {
      case "sbu":
        groupKey = response.respondent.sbu?.name || "Unknown";
        break;
      case "gender":
        groupKey = response.respondent.gender || "Unknown";
        break;
      case "location":
        groupKey = response.respondent.location?.name || "Unknown";
        break;
      case "employment_type":
        groupKey = response.respondent.employment_type?.name || "Unknown";
        break;
      case "level":
        groupKey = response.respondent.level?.name || "Unknown";
        break;
      case "employee_type":
        groupKey = response.respondent.employee_type?.name || "Unknown";
        break;
      case "employee_role":
        groupKey = response.respondent.employee_role?.name || "Unknown";
        break;
    }

    if (!groupedData.has(groupKey)) {
      groupedData.set(groupKey, []);
    }
    groupedData.get(groupKey).push(answer);
  });

  // Process data based on question type
  switch (question.type) {
    case "boolean": {
      const chartData = Array.from(groupedData.entries()).map(([group, answers]) => {
        const trueCount = answers.filter((a: boolean) => a === true).length;
        const total = answers.length;
        return {
          name: group,
          labels: [group], // Changed from ["Yes"] to [group] to match chart data structure
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
      break;
    }

    case "rating": {
      if (question.rateCount === 10) {
        // NPS comparison
        const chartData = Array.from(groupedData.entries()).map(([group, answers]) => {
          const validAnswers = answers.filter((a: number) => typeof a === "number");
          const detractors = validAnswers.filter((r: number) => r <= 6).length;
          const promoters = validAnswers.filter((r: number) => r > 8).length;
          const total = validAnswers.length;
          const npsScore = ((promoters - detractors) / total) * 100;

          return {
            name: group,
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
        // Regular rating comparison
        const chartData = Array.from(groupedData.entries()).map(([group, answers]) => {
          const validAnswers = answers.filter((a: number) => typeof a === "number");
          const average = validAnswers.reduce((a: number, b: number) => a + b, 0) / validAnswers.length;

          return {
            name: group,
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
      break;
    }
  }
};
