
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { AIPromptsTable } from "./components/AIPromptsTable";
import { AIPromptDialog } from "./components/AIPromptDialog";

interface AIPrompt {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  prompt_text: string;
  category: 'general_analysis' | 'demographic_insights' | 'response_patterns' | 'improvement_suggestions' | 'action_items';
  color_code?: string;
  created_at?: string;
  updated_at?: string;
}

export default function AIPromptsConfig() {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<AIPrompt | undefined>();

  const { data: prompts, isLoading, refetch } = useQuery({
    queryKey: ['ai-prompts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analysis_prompts')
        .select('*')
        .order('name', { ascending: sortOrder === 'asc' });

      if (error) throw error;
      return (data || []) as AIPrompt[];
    },
  });

  const handleSubmit = async (values: { 
    name: string; 
    category: AIPrompt['category']; 
    prompt_text: string;
    color_code?: string;
  }) => {
    try {
      if (selectedPrompt) {
        const { error } = await supabase
          .from('analysis_prompts')
          .update({
            name: values.name,
            category: values.category,
            prompt_text: values.prompt_text,
            color_code: values.color_code,
          })
          .eq('id', selectedPrompt.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "AI Prompt updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('analysis_prompts')
          .insert({
            name: values.name,
            category: values.category,
            prompt_text: values.prompt_text,
            color_code: values.color_code,
            status: 'active'
          });

        if (error) throw error;
        toast({
          title: "Success",
          description: "AI Prompt created successfully",
        });
      }
      
      setDialogOpen(false);
      setSelectedPrompt(undefined);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: selectedPrompt 
          ? "Failed to update AI Prompt" 
          : "Failed to create AI Prompt",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('analysis_prompts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Success",
        description: "AI Prompt deleted successfully",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete AI Prompt",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (id: string, newStatus: 'active' | 'inactive') => {
    try {
      const { error } = await supabase
        .from('analysis_prompts')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Success",
        description: "AI Prompt status updated successfully",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update AI Prompt status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">AI Prompts</h1>
        <Button onClick={() => {
          setSelectedPrompt(undefined);
          setDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Prompt
        </Button>
      </div>
      
      <AIPromptsTable
        items={prompts || []}
        isLoading={isLoading}
        sortOrder={sortOrder}
        onSort={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        onEdit={(prompt) => {
          setSelectedPrompt(prompt);
          setDialogOpen(true);
        }}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      <AIPromptDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialValues={selectedPrompt}
      />
    </div>
  );
}
