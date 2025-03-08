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

  // Draw pie chart segments
  if (total > 0) {
    const yesPercent = yes / total;
    
    // Draw base circle for "No" responses
    pdf.setFillColor(THEME.chart.colors[1]);
    pdf.circle(centerX, centerY, radius, 'F');
    
    // Draw "Yes" segment if there are any
    if (yes > 0) {
      pdf.setFillColor(THEME.chart.colors[0]);
      // Using ellipse to draw the "Yes" portion of the pie
      const startAngle = 0;
      const endAngle = (yesPercent * 360);
      pdf.ellipse(centerX, centerY, radius, radius, 'F');
    }
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

export async function addComparisonChart(
  pdf: jsPDF,
  question: Question,
  processedData: ProcessedData,
  dimension: string
) {
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

  // Draw comparison charts based on question type
  const startY = 200;
  const itemHeight = 100;
  const barWidth = 600;
  const labelX = 150;

  Array.from(groupedData.entries()).forEach(([group, answers], index) => {
    const y = startY + (index * itemHeight);
    
    pdf.setFontSize(14);
    pdf.setTextColor(THEME.text.primary);
    pdf.text(group, labelX, y);

    if (question.type === "boolean") {
      const total = answers.length;
      const yes = answers.filter((a: boolean) => a === true).length;
      const width = (yes / total) * barWidth;

      pdf.setFillColor(THEME.chart.colors[1]);
      pdf.rect(labelX + 200, y - 15, barWidth, 20, 'F');
      
      pdf.setFillColor(THEME.chart.colors[0]);
      pdf.rect(labelX + 200, y - 15, width, 20, 'F');

      pdf.text(`${Math.round((yes / total) * 100)}%`, labelX + barWidth + 220, y);
    } else if (question.type === "rating") {
      const isNps = question.rateCount === 10;
      if (isNps) {
        const detractors = answers.filter((r: number) => r <= 6).length;
        const passives = answers.filter((r: number) => r > 6 && r <= 8).length;
        const promoters = answers.filter((r: number) => r > 8).length;
        const total = answers.length;

        const dWidth = (detractors / total) * barWidth;
        const pWidth = (passives / total) * barWidth;
        const prWidth = (promoters / total) * barWidth;

        pdf.setFillColor("#ef4444");
        pdf.rect(labelX + 200, y - 15, dWidth, 20, 'F');
        
        pdf.setFillColor("#eab308");
        pdf.rect(labelX + 200 + dWidth, y - 15, pWidth, 20, 'F');
        
        pdf.setFillColor("#22c55e");
        pdf.rect(labelX + 200 + dWidth + pWidth, y - 15, prWidth, 20, 'F');
      } else {
        const unsatisfied = answers.filter((r: number) => r <= 2).length;
        const neutral = answers.filter((r: number) => r === 3).length;
        const satisfied = answers.filter((r: number) => r >= 4).length;
        const total = answers.length;

        const uWidth = (unsatisfied / total) * barWidth;
        const nWidth = (neutral / total) * barWidth;
        const sWidth = (satisfied / total) * barWidth;

        pdf.setFillColor("#ef4444");
        pdf.rect(labelX + 200, y - 15, uWidth, 20, 'F');
        
        pdf.setFillColor("#eab308");
        pdf.rect(labelX + 200 + uWidth, y - 15, nWidth, 20, 'F');
        
        pdf.setFillColor("#22c55e");
        pdf.rect(labelX + 200 + uWidth + nWidth, y - 15, sWidth, 20, 'F');
      }
    }
  });
}
