
import { unparse } from "papaparse";
import html2canvas from "html2canvas";

export async function exportToImage(element: HTMLElement, type: "png" | "svg", filename: string) {
  if (type === "png") {
    const canvas = await html2canvas(element);
    const dataUrl = canvas.toDataURL("image/png");
    downloadFile(dataUrl, `${filename}.png`);
  } else {
    const svgElement = element.querySelector("svg");
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      downloadFile(url, `${filename}.svg`);
      URL.revokeObjectURL(url);
    }
  }
}

export function exportToCSV(data: any[], filename: string) {
  const csv = unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadFile(URL.createObjectURL(blob), `${filename}.csv`);
}

export function exportToJSON(data: any, filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  downloadFile(URL.createObjectURL(blob), `${filename}.json`);
}

function downloadFile(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
