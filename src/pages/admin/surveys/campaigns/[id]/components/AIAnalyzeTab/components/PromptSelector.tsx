
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Search, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PromptSelectorProps {
  onAnalyze: (promptData: { id: string, text: string }) => void;
  isAnalyzing?: boolean;
  selectedPromptId?: string;
}

interface Prompt {
  id: string;
  name: string;
  category: string;
  prompt_text: string;
  status: 'active';
}

export function PromptSelector({ onAnalyze, isAnalyzing, selectedPromptId }: PromptSelectorProps) {
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrompts?.map((prompt) => (
          <Card
            key={prompt.id}
            className={cn(
              "transition-colors",
              selectedPromptId === prompt.id && "ring-2 ring-primary"
            )}
          >
            <CardHeader>
              <CardTitle className="text-lg">{prompt.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {prompt.prompt_text}
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={() => onAnalyze({ 
                  id: prompt.id, 
                  text: prompt.prompt_text 
                })}
                disabled={isAnalyzing && selectedPromptId === prompt.id}
              >
                <Brain className="h-4 w-4 mr-2" />
                {isAnalyzing && selectedPromptId === prompt.id ? "Analyzing..." : "Analyze"}
              </Button>
            </CardFooter>
          </Card>
        ))}
        {filteredPrompts?.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground p-4">
            No prompts found
          </div>
        )}
      </div>
    </div>
  );
}
