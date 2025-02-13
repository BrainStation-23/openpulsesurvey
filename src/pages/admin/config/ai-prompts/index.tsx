
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ConfigPage } from "../shared/ConfigPage";

interface AIPrompt {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  prompt_text: string;
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

  const handleCreate = async (values: { name: string }) => {
    const { error } = await supabase
      .from('analysis_prompts')
      .insert([
        {
          name: values.name,
          prompt_text: '',
          status: 'active',
        },
      ]);

    if (error) throw error;
    refetch();
  };

  const handleUpdate = async (id: string, values: { name: string }) => {
    const { error } = await supabase
      .from('analysis_prompts')
      .update({ name: values.name })
      .eq('id', id);

    if (error) throw error;
    refetch();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('analysis_prompts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    refetch();
  };

  const handleToggleStatus = async (id: string, newStatus: 'active' | 'inactive') => {
    const { error } = await supabase
      .from('analysis_prompts')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) throw error;
    refetch();
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
