
import jsPDF from 'jspdf';
import { CampaignData } from "../types";
import { ProcessedData } from "../types/responses";
import { THEME } from "./pptx/theme";
import { createTitleSlide, createCompletionSlide, createQuestionSlides } from "./pdf/slides";

export async function exportToPdf(
  campaign: CampaignData,
  processedData: ProcessedData,
  onProgress?: (current: number, total: number) => void
) {
  try {
    // Initialize PDF document
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: [1920, 1080]
    });

    // Set default font and colors
    pdf.setFont("helvetica");
    pdf.setTextColor(THEME.text.primary);
    
    let currentSlide = 1;
    const totalSlides = 2 + processedData.questions.length; // Title + Completion + Questions
    
    // Create title slide
    onProgress?.(currentSlide++, totalSlides);
    createTitleSlide(pdf, campaign);
    
    // Create completion slide
    onProgress?.(currentSlide++, totalSlides);
    createCompletionSlide(pdf, campaign);
    
    // Create question slides
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
