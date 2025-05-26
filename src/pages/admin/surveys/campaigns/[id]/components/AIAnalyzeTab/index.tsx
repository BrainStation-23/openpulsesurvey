
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PromptSelector } from "./components/PromptSelector";
import { AnalysisViewer } from "./components/AnalysisViewer";
import { useAnalysisData } from "./hooks/useAnalysisData";
import { AIQueueMonitor } from "../AIQueueMonitor";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AIAnalyzeTabProps {
  campaignId: string;
  instanceId?: string;
}

export function AIAnalyzeTab({ campaignId, instanceId }: AIAnalyzeTabProps) {
  const [selectedPromptId, setSelectedPromptId] = useState<string>();
  const [analysisContent, setAnalysisContent] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Get instance status for the AI Queue Monitor
  const { data: instance } = useQuery({
    queryKey: ["campaign-instance", instanceId],
    queryFn: async () => {
      if (!instanceId) return null;
      const { data, error } = await supabase
        .from("campaign_instances")
        .select("status")
        .eq("id", instanceId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!instanceId,
  });

  const { data: analysisData } = useAnalysisData(campaignId, instanceId);

  const handleAnalyze = async (promptData: { id: string, text: string }) => {
    if (!instanceId || !analysisData) return;
    
    setIsAnalyzing(true);
    setSelectedPromptId(promptData.id);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-campaign', {
        body: {
          campaignId,
          instanceId,
          prompt: promptData.text,
          analysisData
        }
      });

      if (error) throw error;
      
      setAnalysisContent(data.analysis || "Analysis completed successfully.");
    } catch (error) {
      console.error('Error generating analysis:', error);
      setAnalysisContent("Error generating analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!instanceId) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIQueueMonitor />
        <Card>
          <CardHeader>
            <CardTitle>AI Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Please select a campaign instance to view AI analysis.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIQueueMonitor 
          instanceStatus={instance?.status}
          selectedInstanceId={instanceId}
        />
        <PromptSelector
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          selectedPromptId={selectedPromptId}
        />
      </div>

      {analysisContent && (
        <AnalysisViewer
          content={analysisContent}
          isLoading={isAnalyzing}
        />
      )}
    </div>
  );
}
