
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Objective } from '@/types/okr';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export type ObjectiveVisibilityCategory = 'all' | 'organization' | 'department' | 'team' | 'private';

export const useObjectivesByVisibility = (cycleId?: string) => {
  const { user } = useCurrentUser();
  const [selectedCategory, setSelectedCategory] = useState<ObjectiveVisibilityCategory>('all');

  // Fetch all objectives for the given cycle
  const { data: allObjectives, isLoading, error, refetch } = useQuery({
    queryKey: ['objectives', 'by-visibility', cycleId, selectedCategory],
    queryFn: async () => {
      // Base query to get objectives
      let query = supabase
        .from('objectives')
        .select(`
          *,
          owners:profiles!objectives_owner_id_fkey(id, full_name, email, avatar_url),
          key_results:key_results(id)
        `);
      
      // Filter by cycle if provided
      if (cycleId) {
        query = query.eq('cycle_id', cycleId);
      }

      // Apply additional filters based on the selected category
      if (selectedCategory === 'organization') {
        query = query.eq('visibility', 'organization');
      } else if (selectedCategory === 'department' && user?.sbu_id) {
        // Get department (SBU) objectives - objectives where the owner belongs to user's SBU
        query = query.eq('visibility', 'department');
      } else if (selectedCategory === 'team' && user?.supervisor_id) {
        // Get team objectives - objectives owned by users with the same supervisor as current user
        // or by the supervisor themselves
        query = query.eq('visibility', 'team');
      } else if (selectedCategory === 'private' && user?.id) {
        // Get private objectives - only objectives owned by the current user
        query = query.eq('visibility', 'private').eq('owner_id', user.id);
      }
      
      // Order by creation date
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching objectives by visibility:', error);
        throw error;
      }
      
      return data.map(obj => ({
        ...obj,
        id: obj.id,
        title: obj.title,
        description: obj.description,
        cycleId: obj.cycle_id,
        ownerId: obj.owner_id,
        status: obj.status,
        progress: obj.progress,
        visibility: obj.visibility,
        parentObjectiveId: obj.parent_objective_id,
        sbuId: obj.sbu_id,
        approvalStatus: obj.approval_status,
        createdAt: new Date(obj.created_at),
        updatedAt: new Date(obj.updated_at),
        owner: obj.owners ? {
          id: obj.owners.id,
          fullName: obj.owners.full_name,
          email: obj.owners.email,
          avatarUrl: obj.owners.avatar_url
        } : undefined,
        keyResultsCount: obj.key_results ? obj.key_results.length : 0
      })) as (Objective & { owner?: { id: string, fullName: string, email: string, avatarUrl?: string }, keyResultsCount: number })[];
    },
    enabled: true
  });

  // Separate filtered objectives based on visibility categories
  const organizationalObjectives = allObjectives?.filter(obj => obj.visibility === 'organization') || [];
  const departmentalObjectives = allObjectives?.filter(obj => obj.visibility === 'department') || [];
  const teamObjectives = allObjectives?.filter(obj => obj.visibility === 'team') || [];
  const privateObjectives = allObjectives?.filter(obj => 
    obj.visibility === 'private' && obj.ownerId === user?.id
  ) || [];

  return {
    objectives: allObjectives || [],
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
