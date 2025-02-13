
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptSelectorProps {
  onPromptSelect: (promptData: { id: string, text: string }) => void;
  selectedPromptId?: string;
}

interface Prompt {
  id: string;
  name: string;
  category: string;
  prompt_text: string;
  status: 'active';
}

export function PromptSelector({ onPromptSelect, selectedPromptId }: PromptSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: prompts, isLoading } = useQuery({
    queryKey: ['analysis-prompts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analysis_prompts')
        .select('*')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data as Prompt[];
    },
  });

  const categories = Array.from(
    new Set(prompts?.map(prompt => prompt.category) || [])
  );

  const filteredPrompts = prompts?.filter(prompt => {
    const matchesSearch = prompt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.prompt_text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || prompt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <Input
          disabled
          className="w-full"
          placeholder="Loading prompts..."
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search prompts..."
          className="w-full pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(
              selectedCategory === category ? null : category
            )}
          >
            {category.replace(/_/g, ' ')}
          </Badge>
        ))}
      </div>

      <div className="border rounded-md divide-y">
        {filteredPrompts?.map((prompt) => (
          <div
            key={prompt.id}
            className={cn(
              "p-4 cursor-pointer hover:bg-muted transition-colors",
              selectedPromptId === prompt.id && "bg-muted"
            )}
            onClick={() => onPromptSelect({ 
              id: prompt.id, 
              text: prompt.prompt_text 
            })}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="font-medium">{prompt.name}</div>
                <div className="text-sm text-muted-foreground line-clamp-2">
                  {prompt.prompt_text}
                </div>
              </div>
              {selectedPromptId === prompt.id && (
                <Check className="h-4 w-4 shrink-0" />
              )}
            </div>
          </div>
        ))}
        {filteredPrompts?.length === 0 && (
          <div className="p-4 text-center text-muted-foreground">
            No prompts found
          </div>
        )}
      </div>
    </div>
  );
}
