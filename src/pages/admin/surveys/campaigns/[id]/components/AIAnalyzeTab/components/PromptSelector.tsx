
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PromptSelectorProps {
  onAnalyze: (promptData: { id: string; text: string }) => void;
  analysisData: Record<string, any> | null;
  isAnalyzing: boolean;
}

export function PromptSelector({ onAnalyze, analysisData, isAnalyzing }: PromptSelectorProps) {
  const [selectedPromptId, setSelectedPromptId] = useState<string>("");

  const { data: prompts, isLoading } = useQuery({
    queryKey: ['analysis-prompts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analysis_prompts')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;
      return data;
    }
  });

  const selectedPrompt = prompts?.find(p => p.id === selectedPromptId);

  const handleAnalyze = () => {
    if (selectedPrompt) {
      onAnalyze({
        id: selectedPrompt.id,
        text: selectedPrompt.prompt_text
      });
    }
  };

  if (isLoading) {
    return <div>Loading prompts...</div>;
  }

  return (
    <div className="flex gap-4 items-center">
      <Select value={selectedPromptId} onValueChange={setSelectedPromptId}>
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder="Select a prompt" />
        </SelectTrigger>
        <SelectContent>
          {prompts?.map((prompt) => (
            <SelectItem key={prompt.id} value={prompt.id}>
              {prompt.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button 
        onClick={handleAnalyze}
        disabled={!selectedPromptId || !analysisData || isAnalyzing}
      >
        {isAnalyzing ? "Analyzing..." : "Analyze"}
      </Button>
    </div>
  );
}
