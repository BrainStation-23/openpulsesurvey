
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ConfigPage } from "../shared/ConfigPage";
import { toast } from "@/components/ui/use-toast";

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

  const handleCreate = async (values: { name: string; color_code?: string }) => {
    try {
      const { error } = await supabase
        .from('analysis_prompts')
        .insert({
          name: values.name,
          color_code: values.color_code,
          prompt_text: "Enter your prompt text here...", // Default value for required field
          category: 'general_analysis', // Default value for required field
          status: 'active'
        });

      if (error) throw error;
      toast({
        title: "Success",
        description: "AI Prompt created successfully",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create AI Prompt",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (id: string, values: { name: string; color_code?: string }) => {
    try {
      const { error } = await supabase
        .from('analysis_prompts')
        .update({
          name: values.name,
          color_code: values.color_code,
        })
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Success",
        description: "AI Prompt updated successfully",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update AI Prompt",
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
    <ConfigPage<AIPrompt>
      title="AI Prompts"
      items={prompts || []}
      isLoading={isLoading}
      sortOrder={sortOrder}
      onSort={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      onToggleStatus={handleToggleStatus}
    />
  );
}
