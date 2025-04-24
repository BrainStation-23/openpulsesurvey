
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PromptSelector } from "./components/PromptSelector";
import { AnalysisViewer } from "./components/AnalysisViewer";
import { useToast } from "@/hooks/use-toast";
import { useAnalysisData } from "./hooks/useAnalysisData";

interface AIAnalyzeTabProps {
  campaignId: string;
  instanceId?: string;
}

export function AIAnalyzeTab({ campaignId, instanceId }: AIAnalyzeTabProps) {
  const [selectedPromptId, setSelectedPromptId] = useState<string>();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<{ content: string } | null>(null);
  
  // Use our new consolidated data hook
  const { data: analysisData, isLoading: isLoadingData } = useAnalysisData(campaignId, instanceId);
  
  const handleAnalyze = async (prompt: { id: string, text: string }) => {
    if (!analysisData) return;
    
    try {
      setIsAnalyzing(true);
      setSelectedPromptId(prompt.id);
      
      const { data: analysisResult, error } = await supabase.functions.invoke('analyze-campaign', {
        body: {
          promptId: prompt.id,
          promptText: prompt.text,
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
      return null;
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
        selectedPromptId={selectedPromptId}
        isAnalyzing={isAnalyzing}
      />

      <AnalysisViewer
        content={analysis?.content || "Select a prompt and click Analyze to generate insights."}
        isLoading={isAnalyzing}
      />
    </div>
  );
}
