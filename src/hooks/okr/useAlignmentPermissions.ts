
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ObjectiveVisibility } from '@/types/okr';

/**
 * Hook to check if the current user has permission to create alignments with objectives of different visibility levels
 */
export const useAlignmentPermissions = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['alignment-permissions'],
    queryFn: async () => {
      // Check permissions for different visibility levels
      const checkPermission = async (visibility: ObjectiveVisibility) => {
        const { data, error } = await supabase.rpc(
          'can_create_alignment_by_visibility',
          { p_visibility: visibility }
        );
        
        if (error) {
          console.error(`Error checking alignment permission for ${visibility}:`, error);
          return false;
        }
        
        return !!data;
      };
      
      // Check permissions for each visibility type
      const [
        canAlignWithOrganization,
        canAlignWithDepartment,
        canAlignWithTeam,
        canAlignWithPrivate,
      ] = await Promise.all([
        checkPermission('organization'),
        checkPermission('department'),
        checkPermission('team'),
        checkPermission('private'),
      ]);
      
      return {
        organization: canAlignWithOrganization,
        department: canAlignWithDepartment,
        team: canAlignWithTeam,
        private: canAlignWithPrivate,
        // If the user has permission to align with any visibility, we'll use this flag
        hasAnyPermission: canAlignWithOrganization || canAlignWithDepartment || canAlignWithTeam || canAlignWithPrivate
      };
    },
    staleTime: 5 * 60 * 1000, // Cache permissions for 5 minutes
  });
  
  return {
    permissions: data || {
      organization: false,
      department: false,
      team: false,
      private: false,
      hasAnyPermission: false
    },
    isLoading,
    error
  };
};
