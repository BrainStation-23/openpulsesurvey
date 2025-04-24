
import { useState } from 'react';
import { exportToPptx } from '../utils/pptxExport';
import { CampaignData } from "../types";
import { ProcessedData } from "../types/responses";
import { useToast } from "@/hooks/use-toast";
import { usePresentationExportData } from './usePresentationExportData';

export const usePptxExport = (campaignId: string, instanceId?: string) => {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  
  // Use the optimized data fetching hook
  const { data: exportData, isLoading, error, refetch } = usePresentationExportData(
    campaignId,
    instanceId
  );

  const handleExport = async () => {
    try {
      if (isLoading) {
        toast({
          title: "Please wait",
          description: "Export data is still loading",
          variant: "default",
        });
        return;
      }
      
      if (error || !exportData) {
        toast({
          title: "Cannot export presentation",
          description: "There was an error preparing the data for export",
          variant: "destructive",
        });
        return;
      }

      setExporting(true);
      setProgress(0);
      
      // Start the export process with the pre-processed data
      await exportToPptx(
        exportData.campaign, 
        exportData.data, 
        (progress) => {
          setProgress(progress);
        }
      );
      
      toast({
        title: "Success",
        description: "Presentation has been exported to PPTX successfully",
      });
    } catch (error) {
      console.error("Error exporting PPTX:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting the PPTX presentation",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
      setProgress(0);
    }
  };

  // Force refresh the data
  const refreshExportData = async () => {
    await refetch();
  };

  return { 
    handleExport, 
    exporting, 
    progress, 
    isLoading, 
    refreshExportData,
    hasError: !!error
  };
};
