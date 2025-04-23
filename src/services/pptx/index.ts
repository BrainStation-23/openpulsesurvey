
import { PptxExportService } from "./PptxExportService";
import { PptxExportOptions } from "./types";

/**
 * Exports survey data to PPTX format
 * 
 * @param options Export options including campaignId, instanceId and progress callback
 * @returns Promise with the filename of the exported file
 * 
 * @example
 * ```typescript
 * // Example usage
 * const handleExport = async () => {
 *   try {
 *     const fileName = await exportSurveyToPptx({
 *       campaignId: "your-campaign-id",
 *       instanceId: "optional-instance-id",
 *       onProgress: (progress) => {
 *         setExportProgress(progress);
 *       }
 *     });
 *     
 *     toast({
 *       title: "Export complete",
 *       description: `Presentation saved as ${fileName}`
 *     });
 *   } catch (error) {
 *     toast({
 *       title: "Export failed",
 *       description: error.message,
 *       variant: "destructive"
 *     });
 *   }
 * };
 * ```
 */
export const exportSurveyToPptx = async (options: PptxExportOptions): Promise<string> => {
  return PptxExportService.exportToPptx(options);
};

// Re-export types
export * from "./types";
