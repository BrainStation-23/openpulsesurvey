
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const EXPORT_PADDING = 40; // Horizontal padding
const VERTICAL_PADDING_TOP = 80; // Vertical padding for top
const VERTICAL_PADDING_BOTTOM = 150; // Increased bottom padding to accommodate legends

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
    // Extend the capture area to include more of the bottom content
    height: element.offsetHeight + 100, // Add extra height to capture more at the bottom
  });
  
  const paddedCanvas = document.createElement('canvas');
  paddedCanvas.width = canvas.width + (EXPORT_PADDING * 2);
  paddedCanvas.height = canvas.height + (VERTICAL_PADDING_TOP + VERTICAL_PADDING_BOTTOM);
  
  const ctx = paddedCanvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'white'; // White background
    ctx.fillRect(0, 0, paddedCanvas.width, paddedCanvas.height);
    ctx.drawImage(canvas, EXPORT_PADDING, VERTICAL_PADDING_TOP);
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
    // Extend the capture area to include more of the bottom content
    height: element.offsetHeight + 100, // Add extra height to capture more at the bottom
  });
  
  // Create padded canvas
  const paddedCanvas = document.createElement('canvas');
  paddedCanvas.width = canvas.width + (EXPORT_PADDING * 2);
  paddedCanvas.height = canvas.height + (VERTICAL_PADDING_TOP + VERTICAL_PADDING_BOTTOM);
  
  const ctx = paddedCanvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'white'; // White background
    ctx.fillRect(0, 0, paddedCanvas.width, paddedCanvas.height);
    ctx.drawImage(canvas, EXPORT_PADDING, VERTICAL_PADDING_TOP);
  }
  
  const imgData = paddedCanvas.toDataURL('image/png');
  
  const pdf = new jsPDF({
    orientation: paddedCanvas.width > paddedCanvas.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [paddedCanvas.width, paddedCanvas.height],
    hotfixes: ['px_scaling']
  });
  
  // Add the image
  pdf.addImage(imgData, 'PNG', 0, 0, paddedCanvas.width, paddedCanvas.height);
  
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
