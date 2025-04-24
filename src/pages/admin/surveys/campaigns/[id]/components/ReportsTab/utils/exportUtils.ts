
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

const EXPORT_PADDING = 40; // Add 40px of padding on each side

export const exportAsImage = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2, // Increase scale for better resolution
    useCORS: true,
    logging: false,
    allowTaint: true,
    // Remove the margin property as it's not supported in html2canvas options
  });
  
  const paddedCanvas = document.createElement('canvas');
  paddedCanvas.width = canvas.width + (EXPORT_PADDING * 2);
  paddedCanvas.height = canvas.height + (EXPORT_PADDING * 2);
  
  const ctx = paddedCanvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'white'; // White background
    ctx.fillRect(0, 0, paddedCanvas.width, paddedCanvas.height);
    ctx.drawImage(canvas, EXPORT_PADDING, EXPORT_PADDING);
  }

  const image = paddedCanvas.toDataURL('image/png', 1.0);
  
  const link = document.createElement('a');
  link.download = `${fileName}.png`;
  link.href = image;
  link.click();
};

export const exportAsPDF = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2, // Increase scale for better resolution
    useCORS: true,
    logging: false,
    allowTaint: true,
    // Remove the margin property as it's not supported in html2canvas options
  });
  
  const imgData = canvas.toDataURL('image/png');
  
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [canvas.width + (EXPORT_PADDING * 2), canvas.height + (EXPORT_PADDING * 2)]
  });
  
  // Add white background
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, pdf.internal.pageSize.width, pdf.internal.pageSize.height, 'F');
  
  // Add image with padding
  pdf.addImage(imgData, 'PNG', EXPORT_PADDING, EXPORT_PADDING, canvas.width, canvas.height);
  
  pdf.save(`${fileName}.pdf`);
};

export const exportAsCSV = (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, `${fileName}.csv`);
};

export const exportAsExcel = (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
