
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ConfigPage } from "../shared/ConfigPage";
import { toast } from "sonner";
import { TourButton } from "@/components/onboarding/TourButton";

export default function LevelConfig() {
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
          // If error is because 'rank' doesn't exist, fallback to ordering by name
          if (error.message.includes("column 'rank' does not exist")) {
            const { data: fallbackData, error: fallbackError } = await supabase
              .from('levels')
              .select('*')
              .order('name', { ascending: sortOrder === 'asc' });
            
            if (fallbackError) throw fallbackError;
            
            // Add temporary rank property based on array index
            return fallbackData.map((item, index) => ({
              ...item,
              rank: index + 1
            }));
          } else {
            throw error;
          }
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
        // Get the highest rank value to place new item at the end
        const { data: maxRankResult } = await supabase
          .from('levels')
          .select('rank')
          .order('rank', { ascending: false })
          .limit(1);
        
        const maxRank = maxRankResult && maxRankResult.length > 0 ? maxRankResult[0]?.rank || 0 : 0;
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
          // If error is because 'rank' column doesn't exist
          if (error.message.includes("column \"rank\" of relation \"levels\" does not exist")) {
            // Insert without rank
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
          } else {
            throw error;
          }
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
        // Check if the rank column exists by trying to select it
        const { data: columnCheck, error: columnError } = await supabase
          .from('levels')
          .select('rank')
          .limit(1);
        
        // If the rank column doesn't exist, create it
        if (columnError && columnError.message.includes("column 'rank' does not exist")) {
          // This would require a migration to add the column
          console.warn("Rank column doesn't exist. Please run a migration to add it.");
          return reorderedItems;
        }
        
        // Update each item with its new rank
        const updates = reorderedItems.map((item, index) => ({
          id: item.id,
          rank: index + 1
        }));
        
        // Execute each update
        for (const update of updates) {
          const { error } = await supabase
            .from('levels')
            .update({ rank: update.rank })
            .eq('id', update.id);
          
          if (error) {
            console.error("Error updating rank:", error);
            throw error;
          }
        }
        
        return updates;
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

  return (
    <div className="config-level space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Levels</h2>
        <TourButton tourId="level_config" title="Level Configuration Guide" />
      </div>
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
    </div>
  );
}
