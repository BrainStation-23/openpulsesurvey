
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CampaignData } from "../types";

export async function exportToPdf(campaign: CampaignData) {
  try {
    // Initialize PDF document with A4 landscape format
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
      
      // Store original styles
      const originalDisplay = slide.style.display;
      const originalVisibility = slide.style.visibility;
      const originalOpacity = slide.style.opacity;
      const originalPosition = slide.style.position;
      const originalZIndex = slide.style.zIndex;

      // Make slide visible for capture
      slide.style.display = 'block';
      slide.style.visibility = 'visible';
      slide.style.opacity = '1';
      slide.style.position = 'relative';
      slide.style.zIndex = '9999';

      // Wait for any animations or transitions to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture slide as canvas
      const canvas = await html2canvas(slide, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff',
        allowTaint: true,
        foreignObjectRendering: true,
        imageTimeout: 15000,
        removeContainer: false,
      });

      // Add page if not first slide
      if (i > 0) {
        pdf.addPage();
      }

      // Add canvas to PDF, scaling to fit page
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      pdf.addImage(imgData, 'JPEG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());

      // Restore original styles
      slide.style.display = originalDisplay;
      slide.style.visibility = originalVisibility;
      slide.style.opacity = originalOpacity;
      slide.style.position = originalPosition;
      slide.style.zIndex = originalZIndex;
    }

    // Save the PDF
    const fileName = `${campaign.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_presentation.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
}
