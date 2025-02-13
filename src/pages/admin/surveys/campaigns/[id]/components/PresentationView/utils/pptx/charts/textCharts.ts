
import pptxgen from "pptxgenjs";
import { THEME } from "../theme";

export const addTextChart = (
  slide: pptxgen.Slide,
  answers: string[]
) => {
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
      labels: [text] as string[],
      values: [value]
    }))
    .sort((a, b) => b.values[0] - a.values[0])
    .slice(0, 10);

  // Optimized dimensions and gradient colors
  slide.addChart("bar", topWords, {
    x: 1,
    y: 1.5,
    w: 8,
    h: 3.5,
    barDir: "col",
    chartColors: topWords.map((_, index) => THEME.chart.colors[index % THEME.chart.colors.length]),
    showLegend: false,
    dataLabelFormatCode: '0',
    catAxisTitle: "Words",
    valAxisTitle: "Frequency",
  });

  slide.addText([
    { text: "Total Responses: ", options: { bold: true } },
    { text: `${answers.length}` },
    { text: "\nUnique Words: ", options: { bold: true } },
    { text: `${Object.keys(wordFrequency).length}` },
  ], {
    x: 0.5,
    y: 5.8,
    w: "90%",
    fontSize: 12,
    color: THEME.text.primary,
  });
};
