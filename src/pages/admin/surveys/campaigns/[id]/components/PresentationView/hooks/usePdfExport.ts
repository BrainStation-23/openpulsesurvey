
import { useState } from 'react';
import { exportToPdf } from '../utils/pdfExport';
import { CampaignData } from "../types";
import { ProcessedData } from "../types/responses";
import { useToast } from "@/hooks/use-toast";

export function usePdfExport() {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleExport = async (campaign: CampaignData, processedData: ProcessedData) => {
    try {
      if (!processedData) {
        toast({
          title: "Cannot export presentation",
          description: "Please wait for the data to load",
          variant: "destructive",
        });
        return;
      }

      setExporting(true);
      setProgress(0);
      
      await exportToPdf(campaign, processedData, (current, total) => {
        setProgress(Math.round((current / total) * 100));
      });
      
      toast({
        title: "Success",
        description: "Presentation has been exported to PDF successfully",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting the PDF presentation",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
      setProgress(0);
    }
  };

  return { handleExport, exporting, progress };
}
