
import Papa from 'papaparse';
import html2canvas from 'html2canvas';

/**
 * Export data as CSV
 */
export const exportToCSV = (data: any[], filename: string) => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
};

/**
 * Export data as JSON
 */
export const exportToJSON = (data: any, filename: string) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, `${filename}.json`);
};

/**
 * Export chart as PNG image
 */
export const exportToPNG = async (element: HTMLElement, filename: string) => {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher scale for better quality
    });
    
    canvas.toBlob((blob) => {
      if (blob) {
        downloadBlob(blob, `${filename}.png`);
      }
    }, 'image/png');
  } catch (error) {
    console.error('Error exporting to PNG:', error);
  }
};

/**
 * Export chart as SVG
 */
export const exportToSVG = (element: HTMLElement, filename: string) => {
  try {
    // Find the SVG element within the container
    const svgElement = element.querySelector('svg');
    
    if (!svgElement) {
      throw new Error('No SVG element found');
    }
    
    // Clone the SVG to avoid modifying the original
    const svgClone = svgElement.cloneNode(true) as SVGElement;
    
    // Ensure SVG has proper namespaces
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    
    // Get SVG as string
    const svgString = new XMLSerializer().serializeToString(svgClone);
    
    // Create Blob and download
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    downloadBlob(blob, `${filename}.svg`);
  } catch (error) {
    console.error('Error exporting to SVG:', error);
  }
};

/**
 * Helper function to download a Blob as a file
 */
const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Format chart data for export based on chart type
 */
export const formatChartDataForExport = (
  data: any, 
  chartType: 'bar' | 'line' | 'pie' | 'donut' | 'wordcloud' | 'boolean' | 'nps' | 'table'
): any[] => {
  // Default case: return the data as is if it's already an array
  if (Array.isArray(data)) {
    return data;
  }
  
  // Handle specific chart types
  switch (chartType) {
    case 'boolean':
      return [
        { category: 'Yes', value: data.yes },
        { category: 'No', value: data.no }
      ];
      
    case 'pie':
    case 'donut':
      return Object.entries(data).map(([key, value]) => ({
        category: key,
        value
      }));
      
    case 'wordcloud':
      return data.map((item: any) => ({
        word: item.text,
        count: item.value
      }));
      
    default:
      // If data structure is unknown, try to convert object to array
      if (typeof data === 'object' && data !== null) {
        return Object.entries(data).map(([key, value]) => ({ key, value }));
      }
      return [];
  }
};
