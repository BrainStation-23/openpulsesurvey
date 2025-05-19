
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useLevelManagement = () => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const queryClient = useQueryClient();

  const { data: levels, isLoading } = useQuery({
    queryKey: ['levels', sortOrder],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('levels')
          .select('*')
          .order('rank', { ascending: sortOrder === 'asc' });
        
        if (error) {
          if (error.message.includes("column 'rank' does not exist")) {
            const { data: fallbackData, error: fallbackError } = await supabase
              .from('levels')
              .select('*')
              .order('name', { ascending: sortOrder === 'asc' });
            
            if (fallbackError) throw fallbackError;
            
            return fallbackData.map((item, index) => ({
              ...item,
              rank: index + 1
            }));
          }
          throw error;
        }
        
        return data;
      } catch (error) {
        console.error("Error fetching levels:", error);
        throw error;
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: { name: string; color_code?: string }) => {
      try {
        const { data: maxRankResult } = await supabase
          .from('levels')
          .select('rank')
          .order('rank', { ascending: false })
          .limit(1);
        
        const maxRank = maxRankResult && maxRankResult.length > 0 ? maxRankResult[0]?.rank ?? 0 : 0;
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
        
        if (error) {
          if (error.message.includes("column \"rank\" of relation \"levels\" does not exist")) {
            const { data: fallbackData, error: fallbackError } = await supabase
              .from('levels')
              .insert([{ 
                name: values.name, 
                color_code: values.color_code
              }])
              .select()
              .single();
            
            if (fallbackError) throw fallbackError;
            return { ...fallbackData, rank: 0 };
          }
          throw error;
        }
        
        return data;
      } catch (error) {
        console.error("Error creating level:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['levels'] });
      toast.success("Level created successfully");
    },
    onError: (error) => {
      console.error("Create error:", error);
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
      try {
        const { error: columnError } = await supabase
          .from('levels')
          .select('rank')
          .limit(1);
        
        if (columnError && columnError.message.includes("column 'rank' does not exist")) {
          console.warn("Rank column doesn't exist. Please run a migration to add it.");
          return reorderedItems;
        }
        
        for (const update of reorderedItems.map((item, index) => ({
          id: item.id,
          rank: index + 1
        }))) {
          const { error } = await supabase
            .from('levels')
            .update({ rank: update.rank })
            .eq('id', update.id);
          
          if (error) {
            console.error("Error updating rank:", error);
            throw error;
          }
        }
        
        return reorderedItems;
      } catch (error) {
        console.error("Reorder error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['levels'] });
      toast.success("Levels reordered successfully");
    },
    onError: (error) => {
      console.error("Failed to reorder levels:", error);
      toast.error("Failed to reorder levels");
    },
  });

  const handleSort = () => {
    setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
  };

  return {
    levels,
    isLoading,
    sortOrder,
    handleSort,
    createMutation,
    updateMutation,
    deleteMutation,
    toggleStatusMutation,
    reorderMutation,
  };
};
