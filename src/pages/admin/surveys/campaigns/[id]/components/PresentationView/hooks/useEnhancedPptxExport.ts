
import { useState } from 'react';
import { CampaignData } from "../types";
import { useToast } from "@/hooks/use-toast";
import { exportToPptx } from "../services/pptxExport/exportService";
import { PptxExportConfig } from "../services/pptxExport/types";

export const useEnhancedPptxExport = () => {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const { toast } = useToast();

  const handleQuickExport = async (campaign: CampaignData, instanceId?: string) => {
    try {
      if (!campaign) {
        toast({
          title: "Cannot export presentation",
          description: "Campaign data is missing",
          variant: "destructive",
        });
        return;
      }

      setExporting(true);
      setProgress(0);
      
      await exportToPptx(campaign, instanceId, {
        onProgress: (progress) => {
          setProgress(progress);
        }
      });
      
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

  const handleConfiguredExport = async (
    campaign: CampaignData, 
    instanceId: string | undefined,
    config: Partial<PptxExportConfig>
  ) => {
    try {
      if (!campaign) {
        toast({
          title: "Cannot export presentation",
          description: "Campaign data is missing",
          variant: "destructive",
        });
        return;
      }

      setExporting(true);
      setProgress(0);
      
      await exportToPptx(campaign, instanceId, {
        ...config,
        onProgress: (progress) => {
          setProgress(progress);
        }
      });
      
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

  const openConfigDialog = () => {
    setShowConfigDialog(true);
  };

  const closeConfigDialog = () => {
    setShowConfigDialog(false);
  };

  return { 
    handleQuickExport, 
    handleConfiguredExport,
    openConfigDialog,
    closeConfigDialog,
    showConfigDialog,
    exporting, 
    progress 
  };
};
