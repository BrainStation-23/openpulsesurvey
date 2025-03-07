
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CampaignData } from "../types";

export async function exportToPdf(campaign: CampaignData) {
  try {
    // Initialize PDF document
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [1920, 1080]
    });

    // Get all slides
    const slides = document.querySelectorAll('.slide');
    
    // Convert each slide to canvas and add to PDF
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i] as HTMLElement;
      
      // Make slide visible temporarily for capture
      const wasActive = slide.classList.contains('active');
      slide.classList.add('active');
      slide.style.opacity = '1';
      slide.style.display = 'block';

      // Capture slide as canvas
      const canvas = await html2canvas(slide, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Add page if not first slide
      if (i > 0) {
        pdf.addPage();
      }

      // Add canvas to PDF
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      pdf.addImage(imgData, 'JPEG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());

      // Restore slide visibility
      if (!wasActive) {
        slide.classList.remove('active');
        slide.style.opacity = '';
        slide.style.display = '';
      }
    }

    // Save the PDF
    const fileName = `${campaign.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_presentation.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
}
