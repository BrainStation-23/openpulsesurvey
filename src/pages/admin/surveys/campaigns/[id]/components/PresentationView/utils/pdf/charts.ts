
import jsPDF from 'jspdf';
import { Question, ProcessedData } from "../../types/responses";
import { THEME } from "../pptx/theme";

export async function addQuestionChart(
  pdf: jsPDF,
  question: Question,
  processedData: ProcessedData
) {
  const responses = processedData.responses
    .filter(r => r.answers[question.name]?.answer !== undefined)
    .map(r => r.answers[question.name].answer);

  switch (question.type) {
    case "boolean":
      addBooleanChart(pdf, responses);
      break;
    case "rating":
      addRatingChart(pdf, responses, question.rateCount === 10);
      break;
    case "text":
    case "comment":
      addTextChart(pdf, responses);
      break;
  }
}

function addBooleanChart(pdf: jsPDF, answers: any[]) {
  const yes = answers.filter(a => a === true).length;
  const no = answers.filter(a => a === false).length;
  const total = answers.length;

  const centerX = 960;
  const centerY = 540;
  const radius = 150;

  // Draw pie chart
  const yesAngle = (yes / total) * Math.PI * 2;
  
  pdf.setFillColor(THEME.chart.colors[0]);
  pdf.circle(centerX, centerY, radius, 'F');
  
  pdf.setFillColor(THEME.chart.colors[1]);
  if (no > 0) {
    pdf.setLineWidth(1);
    pdf.setDrawColor(THEME.chart.colors[1]);
    pdf.arc(centerX, centerY, radius, 0, yesAngle, 'F');
  }

  // Add legend
  pdf.setFontSize(14);
  pdf.setTextColor(THEME.text.primary);
  pdf.text(`Yes: ${Math.round((yes / total) * 100)}%`, centerX - 200, centerY + radius + 50);
  pdf.text(`No: ${Math.round((no / total) * 100)}%`, centerX + 100, centerY + radius + 50);
}

function addRatingChart(pdf: jsPDF, answers: any[], isNps: boolean) {
  const validAnswers = answers.filter(
    (rating) => typeof rating === "number"
  );

  if (isNps) {
    const detractors = validAnswers.filter(r => r <= 6).length;
    const passives = validAnswers.filter(r => r > 6 && r <= 8).length;
    const promoters = validAnswers.filter(r => r > 8).length;
    const total = validAnswers.length;

    // Draw stacked bar
    const barWidth = 800;
    const barHeight = 60;
    const startX = 560;
    const startY = 400;

    const dWidth = (detractors / total) * barWidth;
    const pWidth = (passives / total) * barWidth;
    const prWidth = (promoters / total) * barWidth;

    pdf.setFillColor(THEME.chart.colors[1]);
    pdf.rect(startX, startY, dWidth, barHeight, 'F');
    
    pdf.setFillColor(THEME.chart.colors[2]);
    pdf.rect(startX + dWidth, startY, pWidth, barHeight, 'F');
    
    pdf.setFillColor(THEME.chart.colors[0]);
    pdf.rect(startX + dWidth + pWidth, startY, prWidth, barHeight, 'F');

    // Add labels
    pdf.setFontSize(14);
    pdf.text(`Detractors: ${Math.round((detractors / total) * 100)}%`, startX, startY + 100);
    pdf.text(`Passives: ${Math.round((passives / total) * 100)}%`, startX + 300, startY + 100);
    pdf.text(`Promoters: ${Math.round((promoters / total) * 100)}%`, startX + 600, startY + 100);
  } else {
    // Regular satisfaction rating
    const unsatisfied = validAnswers.filter(r => r <= 2).length;
    const neutral = validAnswers.filter(r => r === 3).length;
    const satisfied = validAnswers.filter(r => r >= 4).length;
    const total = validAnswers.length;

    // Draw bars
    const barWidth = 200;
    const maxBarHeight = 300;
    const startY = 700;
    
    const drawBar = (value: number, x: number, label: string, color: string) => {
      const height = (value / total) * maxBarHeight;
      pdf.setFillColor(color);
      pdf.rect(x, startY - height, barWidth, height, 'F');
      
      pdf.setFontSize(14);
      pdf.setTextColor(THEME.text.primary);
      pdf.text(`${label}: ${Math.round((value / total) * 100)}%`, x, startY + 30);
    };

    drawBar(unsatisfied, 560, "Unsatisfied", "#ef4444");
    drawBar(neutral, 860, "Neutral", "#eab308");
    drawBar(satisfied, 1160, "Satisfied", "#22c55e");
  }
}

function addTextChart(pdf: jsPDF, answers: any[]) {
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

  // Draw word frequency bars
  const barHeight = 30;
  const maxWidth = 600;
  const startX = 560;
  const startY = 300;
  const maxCount = Math.max(...sortedWords.map(([, count]) => count));

  sortedWords.forEach(([word, count], index) => {
    const y = startY + (index * (barHeight + 20));
    const width = (count / maxCount) * maxWidth;

    pdf.setFillColor(THEME.chart.colors[index % THEME.chart.colors.length]);
    pdf.rect(startX, y, width, barHeight, 'F');

    pdf.setFontSize(14);
    pdf.setTextColor(THEME.text.primary);
    pdf.text(`${word} (${count})`, startX + width + 20, y + 20);
  });
}
