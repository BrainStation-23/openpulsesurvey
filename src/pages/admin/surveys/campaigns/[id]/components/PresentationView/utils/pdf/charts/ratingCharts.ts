
import jsPDF from 'jspdf';
import { THEME } from "../../pptx/theme";

export function addRatingChart(pdf: jsPDF, answers: any[], isNps: boolean) {
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
