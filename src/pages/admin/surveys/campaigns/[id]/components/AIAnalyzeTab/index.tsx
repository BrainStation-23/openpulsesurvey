
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PromptSelector } from "./components/PromptSelector";
import { AnalysisViewer } from "./components/AnalysisViewer";
import { Button } from "@/components/ui/button";
import { Brain, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIAnalyzeTabProps {
  campaignId: string;
  instanceId?: string;
}

interface SelectedPrompt {
  id: string;
  text: string;
}

export function AIAnalyzeTab({ campaignId, instanceId }: AIAnalyzeTabProps) {
  const [selectedPrompt, setSelectedPrompt] = useState<SelectedPrompt>();
  const { toast } = useToast();
  
  const { data: analysis, isLoading, refetch } = useQuery({
    queryKey: ['campaign-analysis', campaignId, instanceId, selectedPrompt?.id],
    queryFn: async () => {
      if (!selectedPrompt?.id) return null;

      const { data: analysisResult, error } = await supabase.functions.invoke('analyze-campaign', {
        body: {
          campaignId,
          instanceId,
          promptId: selectedPrompt.id,
          promptText: selectedPrompt.text,
        },
      });

      if (error) throw error;
      return analysisResult;
    },
    enabled: !!selectedPrompt?.id,
  });

  const handleAnalyze = async () => {
    try {
      await refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate analysis",
      });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <PromptSelector
            onPromptSelect={setSelectedPrompt}
            selectedPromptId={selectedPrompt?.id}
          />
          <Button
            onClick={handleAnalyze}
            disabled={!selectedPrompt?.id || isLoading}
          >
            <Brain className="mr-2 h-4 w-4" />
            {isLoading ? "Analyzing..." : "Analyze"}
          </Button>
        </div>
        {analysis?.content && (
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Analysis
          </Button>
        )}
      </div>

      <AnalysisViewer
        content={analysis?.content || "Select a prompt and click Analyze to generate insights."}
        isLoading={isLoading}
      />
    </div>
  );
}
