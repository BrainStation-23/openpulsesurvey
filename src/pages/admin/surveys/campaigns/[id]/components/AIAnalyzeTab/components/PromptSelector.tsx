
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PromptSelectorProps {
  onPromptSelect: (promptId: string) => void;
  selectedPromptId?: string;
}

export function PromptSelector({ onPromptSelect, selectedPromptId }: PromptSelectorProps) {
  const { data: prompts, isLoading } = useQuery({
    queryKey: ['analysis-prompts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analysis_prompts')
        .select('*')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading prompts...</div>;
  }

  return (
    <Select value={selectedPromptId} onValueChange={onPromptSelect}>
      <SelectTrigger className="w-[350px]">
        <SelectValue placeholder="Select an analysis type" />
      </SelectTrigger>
      <SelectContent>
        {prompts?.map((prompt) => (
          <SelectItem key={prompt.id} value={prompt.id}>
            {prompt.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
