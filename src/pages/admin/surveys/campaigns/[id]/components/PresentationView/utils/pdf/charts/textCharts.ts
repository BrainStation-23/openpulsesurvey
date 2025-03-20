
import jsPDF from 'jspdf';
import { THEME } from "../../pptx/theme";

export function addTextChart(pdf: jsPDF, answers: any[]) {
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

  const sortedWords = Object.entries(wordFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  // Calculate the maximum count for scaling
  const maxCount = sortedWords.length > 0 ? sortedWords[0][1] : 0;

  // Draw word frequency bars with grid
  const barHeight = 30;
  const maxWidth = 600;
  const startX = 560;
  const startY = 300;
  const gridSpacing = 100;

  // Draw vertical grid lines
  pdf.setDrawColor("#EEEEEE");
  pdf.setLineWidth(0.5);
  for (let x = startX; x <= startX + maxWidth; x += gridSpacing) {
    pdf.line(x, startY - 30, x, startY + (sortedWords.length * (barHeight + 20)));
  }

  sortedWords.forEach(([word, count], index) => {
    const y = startY + (index * (barHeight + 20));
    const width = (count / maxCount) * maxWidth;

    // Draw bar
    pdf.setFillColor(THEME.chart.colors[index % THEME.chart.colors.length]);
    pdf.rect(startX, y, width, barHeight, 'F');

    // Add label
    pdf.setFontSize(14);
    pdf.setTextColor(THEME.text.primary);
    pdf.text(`${word} (${count} occurrences)`, startX + width + 20, y + 20);
  });
}
