
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CampaignData } from "../types";

interface ExportConfig {
  dimensions?: string[];
  theme?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    light?: string;
    dark?: string;
    text?: {
      primary?: string;
      secondary?: string;
      light?: string;
    };
    chart?: {
      colors?: string[];
    };
  };
  includeTitle?: boolean;
  includeCompletionRate?: boolean;
  includeResponseTrends?: boolean;
  includeTextResponses?: boolean;
  fileName?: string;
  company?: string;
  author?: string;
}

export function useServerPptxExport() {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleExport = async (
    campaign: CampaignData, 
    instanceId: string | null | undefined,
    config?: ExportConfig
  ) => {
    try {
      if (!campaign) {
        toast({
          title: "Cannot export presentation",
          description: "Please wait for the data to load",
          variant: "destructive",
        });
        return;
      }

      setExporting(true);
      setProgress(10);
      
      // Prepare the file name
      const fileName = `${campaign.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_presentation.pptx`;
      
      // Call the edge function
      setProgress(20);
      const { data, error } = await supabase.functions.invoke("pptx-export", {
        body: { 
          campaignId: campaign.id,
          instanceId: instanceId || null,
          config: config || {},
          fileName 
        },
        responseType: 'arraybuffer'
      });
      
      if (error) {
        throw new Error(error.message || "Failed to generate presentation");
      }
      
      setProgress(90);
      
      // Convert the response to a blob and download
      const blob = new Blob([data], { 
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
      });
      
      // Create a temporary URL and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setProgress(100);
      
      toast({
        title: "Success",
        description: "Presentation has been exported to PPTX successfully",
      });
    } catch (error) {
      console.error("Error exporting PPTX:", error);
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "There was an error exporting the PPTX presentation",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
      setProgress(0);
    }
  };

  return { handleExport, exporting, progress };
}
