
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Objective } from '@/types/okr';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { ObjectiveWithOwner } from '@/types/okr-extended';

export type ObjectiveVisibilityCategory = 'all' | 'organization' | 'department' | 'team' | 'private';

export const useObjectivesByVisibility = (cycleId?: string) => {
  const { user } = useCurrentUser();
  const [selectedCategory, setSelectedCategory] = useState<ObjectiveVisibilityCategory>('all');

  // Fetch all objectives for the given cycle
  const { data: allObjectives, isLoading, error, refetch } = useQuery({
    queryKey: ['objectives', 'by-visibility', cycleId, selectedCategory],
    queryFn: async () => {
      try {
        // First, get the user's profile information if needed
        let userSbuId: string | null = null;
        let userSupervisorId: string | null = null;
        
        if (user?.id && (selectedCategory === 'department' || selectedCategory === 'team')) {
          // Get user's SBU from user_sbus table
          if (selectedCategory === 'department') {
            const { data: userSbus } = await supabase
              .from('user_sbus')
              .select('sbu_id')
              .eq('user_id', user.id)
              .eq('is_primary', true)
              .single();
            
            userSbuId = userSbus?.sbu_id || null;
          }
          
          // Get user's supervisor from user_supervisors table
          if (selectedCategory === 'team') {
            const { data: userSupervisor } = await supabase
              .from('user_supervisors')
              .select('supervisor_id')
              .eq('user_id', user.id)
              .eq('is_primary', true)
              .single();
            
            userSupervisorId = userSupervisor?.supervisor_id || null;
          }
        }
        
        // Base query to get objectives
        let query = supabase
          .from('objectives')
          .select(`
            *,
            owners:profiles(id, first_name, last_name, email, profile_image_url),
            key_results:key_results(id)
          `);
        
        // Filter by cycle if provided
        if (cycleId) {
          query = query.eq('cycle_id', cycleId);
        }

        // Apply additional filters based on the selected category
        if (selectedCategory === 'organization') {
          query = query.eq('visibility', 'organization');
        } else if (selectedCategory === 'department' && userSbuId) {
          // Get department (SBU) objectives
          query = query.eq('visibility', 'department').eq('sbu_id', userSbuId);
        } else if (selectedCategory === 'team' && userSupervisorId) {
          // For team visibility:
          // 1. Get objectives owned by the supervisor
          // 2. Get objectives marked as 'team' visibility
          const { data: teamUserIds } = await supabase
            .from('user_supervisors')
            .select('user_id')
            .eq('supervisor_id', userSupervisorId);
          
          const teamMemberIds = teamUserIds?.map(item => item.user_id) || [];
          
          // Include supervisor's ID and all team members
          if (userSupervisorId) {
            teamMemberIds.push(userSupervisorId);
          }
          
          if (teamMemberIds.length > 0) {
            query = query
              .eq('visibility', 'team')
              .in('owner_id', teamMemberIds);
          } else {
            query = query.eq('visibility', 'team');
          }
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
        
        return data.map(obj => {
          // Extract owner data from the owners array properly
          const ownerData = obj.owners && obj.owners.length > 0 ? obj.owners[0] : null;

          return {
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
            owner: ownerData ? {
              id: ownerData.id,
              fullName: `${ownerData.first_name || ''} ${ownerData.last_name || ''}`.trim(),
              email: ownerData.email,
              avatarUrl: ownerData.profile_image_url
            } : undefined,
            keyResultsCount: obj.key_results ? obj.key_results.length : 0
          };
        }) as ObjectiveWithOwner[];
      } catch (error) {
        console.error('Error in useObjectivesByVisibility:', error);
        return [];
      }
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
