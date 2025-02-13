
import pptxgen from "pptxgenjs";
import { THEME } from "../theme";
import { processTextData } from "./helpers/textProcessing";

const COLORS = [
  "#9b87f5",  // Primary Purple
  "#F97316",  // Bright Orange
  "#0EA5E9",  // Ocean Blue
  "#D946EF",  // Magenta Pink
  "#8B5CF6",  // Vivid Purple
  "#D6BCFA",  // Light Purple
];

export const addTextChart = (
  slide: pptxgen.Slide,
  answers: string[]
) => {
  // Process the text data
  const processedWords = processTextData(answers);
  const validAnswers = answers.filter(a => typeof a === "string" && a.trim().length > 0);

  // Calculate slide center and dimensions
  const CENTER_X = 5;
  const CENTER_Y = 3;
  const MAX_RADIUS = 4;

  // Add words in a spiral pattern
  processedWords.forEach((word, index) => {
    // Calculate position in a spiral pattern
    const angle = (index / processedWords.length) * Math.PI * 10;
    const radius = (index / processedWords.length) * MAX_RADIUS;
    const x = CENTER_X + radius * Math.cos(angle);
    const y = CENTER_Y + radius * Math.sin(angle);

    // Add the word
    slide.addText(word.text, {
      x,
      y,
      w: 2,  // Fixed width of 2 inches
      h: 0.5,  // Fixed height of 0.5 inches
      fontSize: word.size,
      color: COLORS[index % COLORS.length],
      bold: word.value > (processedWords[0].value / 2), // Bold if frequency is > 50% of max
      align: "center",
      valign: "middle",
    });
  });

  // Add response statistics at the bottom
  slide.addText([
    { text: "Response Analysis", options: { bold: true, fontSize: 18, color: THEME.text.primary } },
  ], {
    x: 0.5,
    y: 0.5,
    w: "90%",
  });

  // Add statistics
  slide.addText([
    { text: "Total Responses: ", options: { bold: true } },
    { text: `${validAnswers.length}` },
    { text: "\nUnique Words: ", options: { bold: true } },
    { text: `${processedWords.length}` },
    { text: "\n\nTop 5 Words:", options: { bold: true } },
    ...processedWords.slice(0, 5).flatMap((word, index) => [
      { text: `\n${index + 1}. `, options: { bold: true } },
      { text: `${word.text} (${word.value} occurrences)`, options: { color: COLORS[index % COLORS.length] } }
    ])
  ], {
    x: 0.5,
    y: 5,
    w: "90%",
    fontSize: 12,
    color: THEME.text.primary,
  });
};
