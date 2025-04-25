
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
  includeQuestionSlides?: boolean;
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
      
      console.log("Calling pptx-export edge function with parameters:", {
        campaignId: campaign.id,
        instanceId,
        configSummary: {
          fileName,
          includeTitle: config?.includeTitle,
          includeCompletionRate: config?.includeCompletionRate,
          includeQuestionSlides: config?.includeQuestionSlides,
          dimensions: config?.dimensions?.length
        }
      });
      
      // Call the edge function
      setProgress(20);
      try {
        // Get the base URL from the environment variable instead of using the protected property
        const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/pptx-export`;
        const { data: authData } = await supabase.auth.getSession();
        
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authData.session?.access_token || ''}`,
            // Use the environment variable for API key instead of the protected property
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
          },
          body: JSON.stringify({ 
            campaignId: campaign.id,
            instanceId: instanceId || null,
            config: {
              ...config,
              includeQuestionSlides: true  // Make sure this is enabled by default
            },
            fileName 
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Edge function error:", errorText);
          throw new Error(`Failed to generate presentation: ${errorText}`);
        }
        
        setProgress(90);
        
        // Get the binary data
        const blob = await response.blob();
        
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
        console.error("Edge function invocation error:", error);
        throw error;
      }
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
