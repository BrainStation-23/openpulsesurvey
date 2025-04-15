
import pptxgen from "pptxgenjs";
import { THEME } from "../theme";

// Constants for table layout
const TABLE_LAYOUT = {
  startX: 0.5,
  startY: 2,
  width: 9,
  rowHeight: 0.3
};

export const addTextChart = (
  slide: pptxgen.Slide,
  answers: string[]
) => {
  // Process responses and calculate word frequencies
  const wordFrequency: Record<string, number> = {};
  const validAnswers = answers.filter(answer => typeof answer === "string");
  let totalWords = 0;

  validAnswers.forEach((answer) => {
    const words = answer
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter(word => word.length > 2);

    words.forEach((word) => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      totalWords++;
    });
  });

  // Convert to array and sort by frequency
  const processedWords = Object.entries(wordFrequency)
    .map(([text, value]) => ({
      text,
      value,
      percentage: (value / validAnswers.length * 100).toFixed(1)
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 20); // Take top 20 words

  // Add section title
  slide.addText([
    { text: "Response Analysis", options: { bold: true, fontSize: 18, color: THEME.text.primary } },
  ], {
    x: TABLE_LAYOUT.startX,
    y: TABLE_LAYOUT.startY - 1,
    w: "90%",
  });

  // Add table headers
  const tableData = [
    [
      { text: "Word", options: { bold: true, fill: THEME.primary, color: "FFFFFF" } },
      { text: "Frequency", options: { bold: true, fill: THEME.primary, color: "FFFFFF" } },
      { text: "% of Responses", options: { bold: true, fill: THEME.primary, color: "FFFFFF" } },
      { text: "Visualization", options: { bold: true, fill: THEME.primary, color: "FFFFFF" } }
    ]
  ];

  // Add data rows
  processedWords.forEach((word) => {
    const maxBarWidth = 3; // Maximum width for visualization bar
    const barWidth = (word.value / processedWords[0].value) * maxBarWidth;
    
    tableData.push([
      { text: word.text },
      { text: word.value.toString() },
      { text: `${word.percentage}%` },
      {
        text: "█".repeat(Math.round(barWidth * 10)), // Simple bar visualization
        options: { color: THEME.primary }
      }
    ]);
  });

  // Add the table
  slide.addTable(tableData, {
    x: TABLE_LAYOUT.startX,
    y: TABLE_LAYOUT.startY,
    w: TABLE_LAYOUT.width,
    colW: [2, 1.5, 1.5, 4],
    border: { pt: 0.5, color: THEME.border },
    align: "left",
    fontSize: 10,
  });

  // Add summary statistics
  slide.addText([
    { text: "Summary Statistics", options: { bold: true, fontSize: 14, color: THEME.text.primary } },
    { text: "\nTotal Responses: ", options: { bold: true } },
    { text: `${validAnswers.length}` },
    { text: "\nUnique Words: ", options: { bold: true } },
    { text: `${Object.keys(wordFrequency).length}` },
    { text: "\nTotal Words: ", options: { bold: true } },
    { text: `${totalWords}` },
    { text: "\nAverage Words per Response: ", options: { bold: true } },
    { text: `${(totalWords / validAnswers.length).toFixed(1)}` }
  ], {
    x: TABLE_LAYOUT.startX,
    y: TABLE_LAYOUT.startY + (processedWords.length + 1) * TABLE_LAYOUT.rowHeight + 0.5,
    w: "90%",
    fontSize: 12,
    color: THEME.text.primary,
  });
};

