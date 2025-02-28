
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Send, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AnalysisData } from "../types";

interface PromptSelectorProps {
  onAnalyze: (promptData: { id: string, text: string }) => void;
  analysisData: AnalysisData | undefined;
  isAnalyzing: boolean;
}

interface Prompt {
  id: string;
  name: string;
  category: string;
  prompt_text: string;
  status: 'active';
}

export function PromptSelector({ onAnalyze, analysisData, isAnalyzing }: PromptSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);

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

  const getFormattedAnalysisData = () => {
    if (!analysisData) return "No data available";

    const formattedData = {
      "Overview": {
        "Completion Rate": analysisData.overview.completion_rate + '%',
        "Total Responses": analysisData.overview.total_responses,
        "Response Trends": analysisData.overview.response_trends
      },
      "Demographics": {
        "Response Rate by Department": Object.entries(analysisData.demographics.by_department)
          .map(([dept, stats]) => ({
            department: dept,
            total_completed: stats.completed,
            total_assigned: stats.total
          })),
        "Response Rate by Gender": Object.entries(analysisData.demographics.by_gender)
          .map(([gender, stats]) => ({
            gender,
            total_completed: stats.completed,
            total_assigned: stats.total
          })),
        "Response Rate by Location": Object.entries(analysisData.demographics.by_location)
          .map(([location, stats]) => ({
            location,
            total_completed: stats.completed,
            total_assigned: stats.total
          })),
        "Response Rate by Employment Type": Object.entries(analysisData.demographics.by_employment_type)
          .map(([type, stats]) => ({
            type,
            total_completed: stats.completed,
            total_assigned: stats.total
          }))
      },
      "Questions": Object.entries(analysisData.questions).map(([key, data]) => {
        const base = {
          question: data.question,
          type: data.type
        };

        if (data.type === 'rating') {
          return {
            ...base,
            average_score: data.average?.toFixed(1) || 'N/A'
          };
        }
        if (data.type === 'boolean') {
          return {
            ...base,
            true_count: data.true_count || 0,
            false_count: data.false_count || 0
          };
        }
        if (data.type === 'text') {
          return {
            ...base,
            responses: data.responses || []
          };
        }
        return base;
      })
    };

    return JSON.stringify(formattedData, null, 2);
  };

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search prompts..."
            className="pl-9"
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrompts?.map((prompt) => (
          <Card key={prompt.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">{prompt.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {prompt.prompt_text}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedPromptId(prompt.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Data
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Analysis Data Preview</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-auto whitespace-pre-wrap">
                      {getFormattedAnalysisData()}
                    </pre>
                  </div>
                </DialogContent>
              </Dialog>
              <Button 
                onClick={() => onAnalyze({ id: prompt.id, text: prompt.prompt_text })}
                disabled={isAnalyzing}
              >
                <Send className="h-4 w-4 mr-2" />
                Analyze
              </Button>
            </CardFooter>
          </Card>
        ))}
        {filteredPrompts?.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-8">
            No prompts found
          </div>
        )}
      </div>
    </div>
  );
}
