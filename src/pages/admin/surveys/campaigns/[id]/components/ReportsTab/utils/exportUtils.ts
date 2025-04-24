
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const EXPORT_PADDING = 40; // Add 40px of padding on each side

// Sanitize filename to prevent security issues
const sanitizeFilename = (name: string): string => {
  // Remove special characters and limit length
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 50);
};

export const exportAsImage = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2, // Increase scale for better resolution
    useCORS: true,
    logging: false,
    allowTaint: true,
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
  link.download = `${sanitizeFilename(fileName)}.png`;
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
  });
  
  const imgData = canvas.toDataURL('image/png');
  
  // Using jsPDF with constructor compatible with v2.x
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [canvas.width + (EXPORT_PADDING * 2), canvas.height + (EXPORT_PADDING * 2)]
  });
  
  // Add white background
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), 'F');
  
  // Add image with padding
  pdf.addImage(imgData, 'PNG', EXPORT_PADDING, EXPORT_PADDING, canvas.width, canvas.height);
  
  pdf.save(`${sanitizeFilename(fileName)}.pdf`);
};

export const exportAsCSV = (data: any[], fileName: string) => {
  // Using ExcelJS to create CSV
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Data');
  
  // Add headers
  if (data.length > 0) {
    const headers = Object.keys(data[0]);
    worksheet.addRow(headers);
  }
  
  // Add data rows with sanitization
  data.forEach(row => {
    const values = Object.values(row).map(value => {
      // Basic sanitization for cell values
      if (typeof value === 'string' && value.startsWith('=')) {
        return `'${value}`; // Prevent formula injection
      }
      return value;
    });
    worksheet.addRow(values);
  });

  // Generate CSV
  workbook.csv.writeBuffer().then(buffer => {
    const blob = new Blob([buffer], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `${sanitizeFilename(fileName)}.csv`);
  });
};

export const exportAsExcel = (data: any[], fileName: string) => {
  // Using ExcelJS for Excel export
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Data');
  
  // Add headers
  if (data.length > 0) {
    const headers = Object.keys(data[0]);
    worksheet.addRow(headers);
    
    // Style the header row
    worksheet.getRow(1).font = { bold: true };
  }
  
  // Add data rows with sanitization
  data.forEach(row => {
    const values = Object.values(row).map(value => {
      // Basic sanitization for cell values
      if (typeof value === 'string' && value.startsWith('=')) {
        return `'${value}`; // Prevent formula injection
      }
      return value;
    });
    worksheet.addRow(values);
  });
  
  // Auto-fit columns
  worksheet.columns.forEach(column => {
    column.width = 15;
  });

  // Generate Excel file
  workbook.xlsx.writeBuffer().then(buffer => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${sanitizeFilename(fileName)}.xlsx`);
  });
};
