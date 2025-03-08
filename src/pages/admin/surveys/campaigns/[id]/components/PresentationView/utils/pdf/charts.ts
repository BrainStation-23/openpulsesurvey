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

  // Draw grid circles
  pdf.setDrawColor("#EEEEEE");
  pdf.setLineWidth(0.5);
  for (let r = radius / 4; r <= radius; r += radius / 4) {
    pdf.circle(centerX, centerY, r, 'S');
  }

  // Draw pie chart segments
  if (total > 0) {
    const yesPercent = yes / total;
    
    // Draw base circle for "No" responses
    pdf.setFillColor(THEME.chart.colors[1]);
    pdf.circle(centerX, centerY, radius, 'F');
    
    // Draw "Yes" segment if there are any
    if (yes > 0) {
      pdf.setFillColor(THEME.chart.colors[0]);
      const endAngle = (yesPercent * 360);
      pdf.ellipse(centerX, centerY, radius, radius, 'F');
    }
  }

  // Add legend
  const legendY = centerY + radius + 50;
  const legendSpacing = 30;
  
  // Yes legend
  pdf.setFillColor(THEME.chart.colors[0]);
  pdf.rect(centerX - 200, legendY, 20, 20, 'F');
  pdf.setFontSize(14);
  pdf.setTextColor(THEME.text.primary);
  pdf.text(`Yes (${Math.round((yes / total) * 100)}%)`, centerX - 170, legendY + 15);

  // No legend
  pdf.setFillColor(THEME.chart.colors[1]);
  pdf.rect(centerX + 50, legendY, 20, 20, 'F');
  pdf.text(`No (${Math.round((no / total) * 100)}%)`, centerX + 80, legendY + 15);
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

    // Draw grid lines
    const barWidth = 800;
    const barHeight = 60;
    const startX = 560;
    const startY = 400;
    
    // Horizontal grid lines
    pdf.setDrawColor("#EEEEEE");
    pdf.setLineWidth(0.5);
    for (let y = startY - 20; y <= startY + barHeight + 20; y += 20) {
      pdf.line(startX - 20, y, startX + barWidth + 20, y);
    }

    // Draw stacked bar
    const dWidth = (detractors / total) * barWidth;
    const pWidth = (passives / total) * barWidth;
    const prWidth = (promoters / total) * barWidth;

    // Add labels above bars
    pdf.setFontSize(12);
    pdf.setTextColor(THEME.text.primary);
    pdf.text(`${Math.round((detractors / total) * 100)}%`, startX + dWidth/2 - 15, startY - 10);
    pdf.text(`${Math.round((passives / total) * 100)}%`, startX + dWidth + pWidth/2 - 15, startY - 10);
    pdf.text(`${Math.round((promoters / total) * 100)}%`, startX + dWidth + pWidth + prWidth/2 - 15, startY - 10);

    // Draw bars
    pdf.setFillColor(THEME.chart.colors[1]);
    pdf.rect(startX, startY, dWidth, barHeight, 'F');
    
    pdf.setFillColor(THEME.chart.colors[2]);
    pdf.rect(startX + dWidth, startY, pWidth, barHeight, 'F');
    
    pdf.setFillColor(THEME.chart.colors[0]);
    pdf.rect(startX + dWidth + pWidth, startY, prWidth, barHeight, 'F');

    // Add legend
    const legendY = startY + barHeight + 50;
    const legendSpacing = 250;
    
    pdf.setFontSize(14);
    // Detractors legend
    pdf.setFillColor(THEME.chart.colors[1]);
    pdf.rect(startX, legendY, 20, 20, 'F');
    pdf.text('Detractors (0-6)', startX + 30, legendY + 15);
    
    // Passives legend
    pdf.setFillColor(THEME.chart.colors[2]);
    pdf.rect(startX + legendSpacing, legendY, 20, 20, 'F');
    pdf.text('Passives (7-8)', startX + legendSpacing + 30, legendY + 15);
    
    // Promoters legend
    pdf.setFillColor(THEME.chart.colors[0]);
    pdf.rect(startX + legendSpacing * 2, legendY, 20, 20, 'F');
    pdf.text('Promoters (9-10)', startX + legendSpacing * 2 + 30, legendY + 15);

  } else {
    // Regular satisfaction rating
    const unsatisfied = validAnswers.filter(r => r <= 2).length;
    const neutral = validAnswers.filter(r => r === 3).length;
    const satisfied = validAnswers.filter(r => r >= 4).length;
    const total = validAnswers.length;

    // Draw bars with grid
    const barWidth = 200;
    const maxBarHeight = 300;
    const startY = 700;
    const gridSpacing = 50;
    
    // Draw horizontal grid lines
    pdf.setDrawColor("#EEEEEE");
    pdf.setLineWidth(0.5);
    for (let y = startY - maxBarHeight; y <= startY; y += gridSpacing) {
      pdf.line(500, y, 1400, y);
    }
    
    const drawBar = (value: number, x: number, label: string, color: string) => {
      const height = (value / total) * maxBarHeight;
      
      // Draw bar
      pdf.setFillColor(color);
      pdf.rect(x, startY - height, barWidth, height, 'F');
      
      // Add value label on top of bar
      pdf.setFontSize(14);
      pdf.setTextColor(THEME.text.primary);
      pdf.text(`${Math.round((value / total) * 100)}%`, x + barWidth/2 - 15, startY - height - 20);
      
      // Add category label below bar
      pdf.text(label, x + barWidth/2 - pdf.getTextWidth(label)/2, startY + 30);
    };

    drawBar(unsatisfied, 560, "Unsatisfied (1-2)", "#ef4444");
    drawBar(neutral, 860, "Neutral (3)", "#eab308");
    drawBar(satisfied, 1160, "Satisfied (4-5)", "#22c55e");
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

  const startY = 200;
  const itemHeight = 100;
  const barWidth = 600;
  const labelX = 150;
  const gridSpacing = 100;

  // Draw horizontal grid lines
  pdf.setDrawColor("#EEEEEE");
  pdf.setLineWidth(0.5);
  
  Array.from(groupedData.entries()).forEach(([group, answers], index) => {
    const y = startY + (index * itemHeight);
    
    // Add grid lines for each group
    for (let x = labelX + 200; x <= labelX + 200 + barWidth; x += gridSpacing) {
      pdf.line(x, y - 25, x, y + 25);
    }

    pdf.setFontSize(14);
    pdf.setTextColor(THEME.text.primary);
    pdf.text(group, labelX, y);

    if (question.type === "boolean") {
      const total = answers.length;
      const yes = answers.filter((a: boolean) => a === true).length;
      const width = (yes / total) * barWidth;

      // Draw base bar ("No" responses)
      pdf.setFillColor(THEME.chart.colors[1]);
      pdf.rect(labelX + 200, y - 15, barWidth, 20, 'F');
      
      // Draw "Yes" portion
      pdf.setFillColor(THEME.chart.colors[0]);
      pdf.rect(labelX + 200, y - 15, width, 20, 'F');

      // Add percentage label
      pdf.text(`${Math.round((yes / total) * 100)}% Yes`, labelX + barWidth + 220, y);
    } else if (question.type === "rating") {
      const isNps = question.rateCount === 10;
      if (isNps) {
        const total = answers.length;
        const detractors = answers.filter((r: number) => r <= 6).length;
        const passives = answers.filter((r: number) => r > 6 && r <= 8).length;
        const promoters = answers.filter((r: number) => r > 8).length;

        const dWidth = (detractors / total) * barWidth;
        const pWidth = (passives / total) * barWidth;
        const prWidth = (promoters / total) * barWidth;

        // Draw segments
        pdf.setFillColor("#ef4444");
        pdf.rect(labelX + 200, y - 15, dWidth, 20, 'F');
        
        pdf.setFillColor("#eab308");
        pdf.rect(labelX + 200 + dWidth, y - 15, pWidth, 20, 'F');
        
        pdf.setFillColor("#22c55e");
        pdf.rect(labelX + 200 + dWidth + pWidth, y - 15, prWidth, 20, 'F');

        // Add percentage labels
        pdf.setFontSize(12);
        pdf.text(`${Math.round((detractors / total) * 100)}%`, labelX + 200 + dWidth/2 - 15, y - 25);
        pdf.text(`${Math.round((passives / total) * 100)}%`, labelX + 200 + dWidth + pWidth/2 - 15, y - 25);
        pdf.text(`${Math.round((promoters / total) * 100)}%`, labelX + 200 + dWidth + pWidth + prWidth/2 - 15, y - 25);
      } else {
        // Regular satisfaction rating handling
        const total = answers.length;
        const unsatisfied = answers.filter((r: number) => r <= 2).length;
        const neutral = answers.filter((r: number) => r === 3).length;
        const satisfied = answers.filter((r: number) => r >= 4).length;

        const uWidth = (unsatisfied / total) * barWidth;
        const nWidth = (neutral / total) * barWidth;
        const sWidth = (satisfied / total) * barWidth;

        // Draw segments
        pdf.setFillColor("#ef4444");
        pdf.rect(labelX + 200, y - 15, uWidth, 20, 'F');
        
        pdf.setFillColor("#eab308");
        pdf.rect(labelX + 200 + uWidth, y - 15, nWidth, 20, 'F');
        
        pdf.setFillColor("#22c55e");
        pdf.rect(labelX + 200 + uWidth + nWidth, y - 15, sWidth, 20, 'F');

        // Add percentage labels
        pdf.setFontSize(12);
        pdf.text(`${Math.round((unsatisfied / total) * 100)}%`, labelX + 200 + uWidth/2 - 15, y - 25);
        pdf.text(`${Math.round((neutral / total) * 100)}%`, labelX + 200 + uWidth + nWidth/2 - 15, y - 25);
        pdf.text(`${Math.round((satisfied / total) * 100)}%`, labelX + 200 + uWidth + nWidth + sWidth/2 - 15, y - 25);
      }
    }
  });

  // Add legend for the comparison charts
  const legendY = startY + (groupedData.size * itemHeight) + 30;
  
  if (question.type === "boolean") {
    pdf.setFillColor(THEME.chart.colors[0]);
    pdf.rect(labelX + 200, legendY, 20, 20, 'F');
    pdf.text("Yes", labelX + 230, legendY + 15);

    pdf.setFillColor(THEME.chart.colors[1]);
    pdf.rect(labelX + 400, legendY, 20, 20, 'F');
    pdf.text("No", labelX + 430, legendY + 15);
  } else if (question.type === "rating") {
    const isNps = question.rateCount === 10;
    if (isNps) {
      // NPS legend
      const legendSpacing = 250;
      pdf.setFontSize(14);
      
      pdf.setFillColor("#ef4444");
      pdf.rect(labelX + 200, legendY, 20, 20, 'F');
      pdf.text("Detractors (0-6)", labelX + 230, legendY + 15);
      
      pdf.setFillColor("#eab308");
      pdf.rect(labelX + 200 + legendSpacing, legendY, 20, 20, 'F');
      pdf.text("Passives (7-8)", labelX + 230 + legendSpacing, legendY + 15);
      
      pdf.setFillColor("#22c55e");
      pdf.rect(labelX + 200 + legendSpacing * 2, legendY, 20, 20, 'F');
      pdf.text("Promoters (9-10)", labelX + 230 + legendSpacing * 2, legendY + 15);
    } else {
      // Regular rating legend
      const legendSpacing = 250;
      pdf.setFontSize(14);
      
      pdf.setFillColor("#ef4444");
      pdf.rect(labelX + 200, legendY, 20, 20, 'F');
      pdf.text("Unsatisfied (1-2)", labelX + 230, legendY + 15);
      
      pdf.setFillColor("#eab308");
      pdf.rect(labelX + 200 + legendSpacing, legendY, 20, 20, 'F');
      pdf.text("Neutral (3)", labelX + 230 + legendSpacing, legendY + 15);
      
      pdf.setFillColor("#22c55e");
      pdf.rect(labelX + 200 + legendSpacing * 2, legendY, 20, 20, 'F');
      pdf.text("Satisfied (4-5)", labelX + 230 + legendSpacing * 2, legendY + 15);
    }
  }
}
