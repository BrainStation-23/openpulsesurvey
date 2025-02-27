
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<{ content: string } | null>(null);

  // Fetch optimized analysis data
  const { data: analysisData, isLoading: isLoadingData } = useQuery({
    queryKey: ['instance-analysis-data', campaignId, instanceId],
    queryFn: async () => {
      console.log('Fetching analysis data for:', { campaignId, instanceId });
      
      const { data, error } = await supabase
        .schema('public')
        .rpc('get_instance_analysis_data', {
          p_campaign_id: campaignId,
          p_instance_id: instanceId
        });

      if (error) {
        console.error('Error fetching analysis data:', error);
        throw error;
      }
      
      console.log('Analysis data received:', data);
      return data;
    },
    enabled: !!instanceId,
    retry: false // Disable retries so we can see the error clearly
  });
  
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
      return analysisResult;
      
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

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <PromptSelector
          onPromptSelect={setSelectedPrompt}
          selectedPromptId={selectedPrompt?.id}
        />
        
        <div className="flex justify-end gap-3">
          <Button
            onClick={async () => {
              const result = await handleAnalyze();
              if (result) setAnalysis(result);
            }}
            disabled={!selectedPrompt?.id || isAnalyzing || isLoadingData}
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
