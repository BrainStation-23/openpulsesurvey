
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PromptSelector } from "./components/PromptSelector";
import { AnalysisViewer } from "./components/AnalysisViewer";
import { useToast } from "@/hooks/use-toast";

interface AIAnalyzeTabProps {
  campaignId: string;
  instanceId?: string;
}

export function AIAnalyzeTab({ campaignId, instanceId }: AIAnalyzeTabProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<{ content: string } | null>(null);

  const { data: analysisData, isLoading: isLoadingData } = useQuery({
    queryKey: ['instance-analysis-data', campaignId, instanceId],
    queryFn: async () => {
      console.log('Fetching analysis data for:', { campaignId, instanceId });
      
      const { data, error } = await supabase
        .rpc('get_instance_analysis_data', {
          p_campaign_id: campaignId,
          p_instance_id: instanceId
        });

      if (error) throw error;
      return data;
    },
    enabled: !!instanceId && !!campaignId
  });
  
  const handleAnalyze = async (promptData: { id: string, text: string }) => {
    if (!analysisData) return;
    
    try {
      setIsAnalyzing(true);
      const { data: analysisResult, error } = await supabase.functions.invoke('analyze-campaign', {
        body: {
          promptId: promptData.id,
          promptText: promptData.text,
          analysisData 
        },
      });

      if (error) throw error;
      setAnalysis(analysisResult);
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate analysis",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!instanceId) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Please select a period to analyze responses.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PromptSelector
        onAnalyze={handleAnalyze}
        analysisData={analysisData}
        isAnalyzing={isAnalyzing}
      />

      <AnalysisViewer
        content={analysis?.content || "Select a prompt and click Analyze to generate insights."}
        isLoading={isAnalyzing}
      />
    </div>
  );
}
