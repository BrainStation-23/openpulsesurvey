
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PromptSelector } from "./components/PromptSelector";
import { AnalysisViewer } from "./components/AnalysisViewer";
import { useAnalysisData } from "./hooks/useAnalysisData";
import { supabase } from "@/integrations/supabase/client";

interface AIAnalyzeTabProps {
  campaignId: string;
  instanceId?: string;
}

export function AIAnalyzeTab({ campaignId, instanceId }: AIAnalyzeTabProps) {
  const [selectedPromptId, setSelectedPromptId] = useState<string>();
  const [analysisContent, setAnalysisContent] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: analysisData } = useAnalysisData(campaignId, instanceId);

  const handleAnalyze = async (promptData: { id: string, text: string }) => {
    if (!instanceId || !analysisData) return;
    
    setIsAnalyzing(true);
    setSelectedPromptId(promptData.id);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-campaign', {
        body: {
          promptId: promptData.id,
          promptText: promptData.text,
          analysisData
        }
      });

      if (error) throw error;
      
      setAnalysisContent(data.content || "Analysis completed successfully.");
    } catch (error) {
      console.error('Error generating analysis:', error);
      setAnalysisContent("Error generating analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!instanceId) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
      <PromptSelector
        onAnalyze={handleAnalyze}
        isAnalyzing={isAnalyzing}
        selectedPromptId={selectedPromptId}
      />

      {analysisContent && (
        <AnalysisViewer
          content={analysisContent}
          isLoading={isAnalyzing}
        />
      )}
    </div>
  );
}
