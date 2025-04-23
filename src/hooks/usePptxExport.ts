
import { useState } from 'react';
import { exportSurveyToPptx } from '../services/pptx';
import { useToast } from "@/hooks/use-toast";

export function usePptxExport() {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleExport = async (campaignId: string, instanceId?: string) => {
    try {
      setExporting(true);
      setProgress(0);
      
      const fileName = await exportSurveyToPptx({
        campaignId,
        instanceId,
        onProgress: (progress) => {
          setProgress(progress);
        }
      });
      
      toast({
        title: "Export successful",
        description: `Presentation has been exported to ${fileName}`,
      });
      return fileName;
    } catch (error) {
      console.error("Error exporting PPTX:", error);
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      return null;
    } finally {
      setExporting(false);
      setProgress(0);
    }
  };

  return { handleExport, exporting, progress };
}
