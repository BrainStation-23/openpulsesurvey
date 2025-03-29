
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Objective } from '@/types/okr';
import { ObjectiveWithOwner } from '@/types/okr-extended';

export type ObjectiveVisibilityCategory = 'all' | 'organization' | 'department' | 'team' | 'private';

export const useObjectivesByVisibility = (cycleId?: string) => {
  const [selectedCategory, setSelectedCategory] = useState<ObjectiveVisibilityCategory>('all');
  
  const {
    data: objectives,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['objectives-by-visibility', cycleId, selectedCategory],
    queryFn: async () => {
      // Build the base query
      let query = supabase
        .from('objective_statistics')
        .select('*');

      // Apply cycle filter if provided
      if (cycleId) {
        query = query.eq('cycle_id', cycleId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching objectives by visibility:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('No objectives found for cycleId:', cycleId);
        return [];
      }

      console.log('Fetched objectives count:', data.length);
      
      return data.map(obj => ({
        id: obj.id,
        title: obj.title,
        description: obj.description,
        cycleId: obj.cycle_id,
        ownerId: obj.owner_id,
        ownerName: obj.owner_name,
        status: obj.status,
        progress: obj.progress,
        visibility: obj.visibility,
        parentObjectiveId: obj.parent_objective_id,
        sbuId: obj.sbu_id,
        sbuName: obj.sbu_name,
        approvalStatus: obj.approval_status,
        keyResultsCount: obj.key_results_count,
        completedKeyResults: obj.completed_key_results,
        cycleName: obj.cycle_name,
        alignmentsCount: obj.alignments_count,
        // Since created_at and updated_at don't exist in the result, 
        // use default values to satisfy the type requirements
        createdAt: new Date(),
        updatedAt: new Date()
      })) as ObjectiveWithOwner[];
    },
    enabled: true
  });

  // Filter objectives by visibility based on the selected category
  const filteredObjectives = objectives || [];
  const organizationalObjectives = filteredObjectives.filter(obj => obj.visibility === 'organization');
  const departmentalObjectives = filteredObjectives.filter(obj => obj.visibility === 'department');
  const teamObjectives = filteredObjectives.filter(obj => obj.visibility === 'team');
  const privateObjectives = filteredObjectives.filter(obj => obj.visibility === 'private');

  return {
    objectives: filteredObjectives,
    organizationalObjectives,
    departmentalObjectives,
    teamObjectives,
    privateObjectives,
    selectedCategory,
    setSelectedCategory,
    isLoading,
    error,
    refetch
  };
};
