
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ConfigPage } from "../shared/ConfigPage";
import { toast } from "sonner";

export default function LevelConfig() {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const queryClient = useQueryClient();

  const { data: levels, isLoading } = useQuery({
    queryKey: ['levels', sortOrder],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('levels')
        .select('*')
        .order('name', { ascending: sortOrder === 'asc' });
      
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: { name: string; color_code?: string }) => {
      const { data, error } = await supabase
        .from('levels')
        .insert([{ name: values.name, color_code: values.color_code }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['levels'] });
      toast.success("Level created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create level");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...values }: { id: string; name: string; color_code?: string }) => {
      const { data, error } = await supabase
        .from('levels')
        .update({ name: values.name, color_code: values.color_code })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['levels'] });
      toast.success("Level updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update level");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('levels')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['levels'] });
      toast.success("Level deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete level");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: 'active' | 'inactive' }) => {
      const { data, error } = await supabase
        .from('levels')
        .update({ status: newStatus })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['levels'] });
      toast.success("Level status updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update level status");
    },
  });

  const handleSort = () => {
    setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
  };

  return (
    <ConfigPage
      title="Levels"
      items={levels || []}
      isLoading={isLoading}
      sortOrder={sortOrder}
      onSort={handleSort}
      onCreate={createMutation.mutate}
      onUpdate={(id, values) => updateMutation.mutate({ id, ...values })}
      onDelete={deleteMutation.mutate}
      onToggleStatus={(id, newStatus) => toggleStatusMutation.mutate({ id, newStatus })}
    />
  );
}
