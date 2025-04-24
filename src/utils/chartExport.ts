
import html2canvas from "html2canvas";

export type ExportFormat = "png" | "csv" | "json" | "svg";

export async function exportAsImage(element: HTMLElement, fileName: string) {
  try {
    const canvas = await html2canvas(element);
    const image = canvas.toDataURL("image/png", 1.0);
    downloadFile(image, `${fileName}.png`);
  } catch (error) {
    console.error("Failed to export as PNG:", error);
    throw error;
  }
}

export function exportAsSVG(element: HTMLElement, fileName: string) {
  try {
    const svgElement = element.querySelector("svg");
    if (!svgElement) throw new Error("No SVG element found");
    
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    downloadFile(url, `${fileName}.svg`);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export as SVG:", error);
    throw error;
  }
}

export function exportAsCSV(data: any[], fileName: string) {
  try {
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    downloadFile(url, `${fileName}.csv`);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export as CSV:", error);
    throw error;
  }
}

export function exportAsJSON(data: any, fileName: string) {
  try {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    downloadFile(url, `${fileName}.json`);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export as JSON:", error);
    throw error;
  }
}

function downloadFile(url: string, fileName: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const cell = row[header]?.toString() ?? '';
        return cell.includes(',') ? `"${cell}"` : cell;
      }).join(',')
    )
  ];
  
  return csvRows.join('\n');
}
