
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PromptSelector } from "./components/PromptSelector";
import { AnalysisViewer } from "./components/AnalysisViewer";
import { Button } from "@/components/ui/button";
import { Brain, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAnalysisData } from "./hooks/useAnalysisData";

interface AIAnalyzeTabProps {
  campaignId: string;
  instanceId?: string;
}

export function AIAnalyzeTab({ campaignId, instanceId }: AIAnalyzeTabProps) {
  const [selectedPrompt, setSelectedPrompt] = useState<{ id: string; text: string }>();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<{ content: string } | null>(null);
  
  // Use our new consolidated data hook
  const { data: analysisData, isLoading: isLoadingData } = useAnalysisData(campaignId, instanceId);
  
  const handleAnalyze = async () => {
    if (!selectedPrompt?.id || !analysisData) return;
    
    try {
      setIsAnalyzing(true);
      const { data: analysisResult, error } = await supabase.functions.invoke('analyze-campaign', {
        body: {
          promptId: selectedPrompt.id,
          promptText: selectedPrompt.text,
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

  const handleExport = () => {
    if (!analysis?.content) return;
    
    const blob = new Blob([analysis.content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-analysis-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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
      <div className="space-y-4">
        <PromptSelector
          onPromptSelect={setSelectedPrompt}
          selectedPromptId={selectedPrompt?.id}
        />
        
        <div className="flex justify-end gap-3">
          <Button
            onClick={handleAnalyze}
            disabled={!selectedPrompt?.id || !analysisData || isAnalyzing}
          >
            <Brain className="mr-2 h-4 w-4" />
            {isAnalyzing ? "Analyzing..." : "Analyze"}
          </Button>
          
          {analysis?.content && (
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export Analysis
            </Button>
          )}
        </div>
      </div>

      <AnalysisViewer
        content={analysis?.content || "Select a prompt and click Analyze to generate insights."}
        isLoading={isAnalyzing}
      />
    </div>
  );
}
