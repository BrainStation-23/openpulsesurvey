
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
        .order('rank', { ascending: sortOrder === 'asc' });
      
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: { name: string; color_code?: string }) => {
      // Get the highest rank value to place new item at the end
      const { data: maxRankResult } = await supabase
        .from('levels')
        .select('rank')
        .order('rank', { ascending: false })
        .limit(1);
      
      const maxRank = maxRankResult && maxRankResult.length > 0 ? maxRankResult[0].rank || 0 : 0;
      const newRank = maxRank + 1;
      
      const { data, error } = await supabase
        .from('levels')
        .insert([{ 
          name: values.name, 
          color_code: values.color_code,
          rank: newRank 
        }])
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

  const reorderMutation = useMutation({
    mutationFn: async (reorderedItems: any[]) => {
      // Update each item with its new rank
      const updates = reorderedItems.map((item, index) => ({
        id: item.id,
        rank: index + 1
      }));
      
      // Execute each update in a transaction
      for (const update of updates) {
        const { error } = await supabase
          .from('levels')
          .update({ rank: update.rank })
          .eq('id', update.id);
        
        if (error) throw error;
      }
      
      return updates;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['levels'] });
      toast.success("Levels reordered successfully");
    },
    onError: (error) => {
      toast.error("Failed to reorder levels");
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
      onReorder={reorderMutation.mutate}
      draggable={true}
    />
  );
}
