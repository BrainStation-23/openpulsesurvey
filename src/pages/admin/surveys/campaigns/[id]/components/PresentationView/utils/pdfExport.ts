
import { CampaignData } from "../types";
import { ProcessedData } from "../types/responses";
import { createTitleSlide, createCompletionSlide, createQuestionSlides } from "./pdf/slides";
import jsPDF from 'jspdf';
import { THEME } from "./pptx/theme";

export async function exportToPdf(
  campaign: CampaignData,
  processedData: ProcessedData,
  onProgress?: (current: number, total: number) => void
) {
  try {
    // Initialize PDF document with presentation dimensions
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: [1920, 1080]
    });

    // Set default font and colors
    pdf.setFont("helvetica");
    pdf.setTextColor(THEME.text.primary);
    
    let currentSlide = 1;
    const totalSlides = 2 + (processedData.questions.length * 8); // Title + Completion + (Questions * (main + 7 comparison slides))
    
    // Create title slide
    onProgress?.(currentSlide++, totalSlides);
    createTitleSlide(pdf, campaign);
    
    // Create completion slide
    onProgress?.(currentSlide++, totalSlides);
    createCompletionSlide(pdf, campaign);
    
    // Create question slides with comparisons
    await createQuestionSlides(pdf, campaign, processedData, (progress) => {
      onProgress?.(currentSlide + progress, totalSlides);
    });

    // Save the PDF
    const fileName = `${campaign.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_presentation.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
}
