
import jsPDF from 'jspdf';
import { THEME } from "../../pptx/theme";

export function addBooleanChart(pdf: jsPDF, answers: any[]) {
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
