
import jsPDF from 'jspdf';
import { Question, ProcessedData } from "../../../types/responses";
import { THEME } from "../../pptx/theme";

export function addComparisonChart(
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
      case "supervisor":
        // Add support for supervisor grouping in PDF
        const supervisorFirst = response.respondent.supervisor?.first_name || "";
        const supervisorLast = response.respondent.supervisor?.last_name || "";
        groupKey = supervisorFirst && supervisorLast 
          ? `${supervisorFirst} ${supervisorLast}` 
          : "No Supervisor";
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
}
