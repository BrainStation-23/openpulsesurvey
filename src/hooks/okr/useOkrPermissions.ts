
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/use-toast';
import { ObjectiveVisibility } from '@/types/okr';

export type OkrPermissionType = 
  | 'create_objectives' 
  | 'create_key_results' 
  | 'create_alignments';

interface UseOkrPermissionsReturn {
  // Check if current user can create objectives
  canCreateObjectives: boolean;
  
  // Check if current user can create objectives with specific visibility
  canCreateObjectiveWithVisibility: (visibility: ObjectiveVisibility) => boolean;
  
  // Check if current user can create key results
  canCreateKeyResults: boolean;
  
  // Check if current user can create alignments
  canCreateAlignments: boolean;
  
  // Check if current user can align with objectives of specific visibility
  canAlignWithVisibility: (visibility: ObjectiveVisibility) => boolean;
  
  // Check if current user is owner of an objective
  isObjectiveOwner: (objectiveId: string) => Promise<boolean>;
  
  // Flag to indicate if permissions are still loading
  isLoading: boolean;
}

/**
 * Hook to check various OKR permissions for the current user
 */
export const useOkrPermissions = (): UseOkrPermissionsReturn => {
  const { userId, isAdmin } = useCurrentUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState<{
    canCreateObjectives: boolean;
    canCreateOrgObjectives: boolean;
    canCreateDeptObjectives: boolean;
    canCreateTeamObjectives: boolean;
    canCreateKeyResults: boolean;
    canCreateAlignments: boolean;
    canAlignWithOrgObjectives: boolean;
    canAlignWithDeptObjectives: boolean;
    canAlignWithTeamObjectives: boolean;
  }>({
    canCreateObjectives: false,
    canCreateOrgObjectives: false,
    canCreateDeptObjectives: false,
    canCreateTeamObjectives: false,
    canCreateKeyResults: false,
    canCreateAlignments: false,
    canAlignWithOrgObjectives: false,
    canAlignWithDeptObjectives: false,
    canAlignWithTeamObjectives: false,
  });

  useEffect(() => {
    const checkPermissions = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Admin users have all permissions by default
        if (isAdmin) {
          setPermissions({
            canCreateObjectives: true,
            canCreateOrgObjectives: true,
            canCreateDeptObjectives: true,
            canCreateTeamObjectives: true,
            canCreateKeyResults: true,
            canCreateAlignments: true,
            canAlignWithOrgObjectives: true,
            canAlignWithDeptObjectives: true,
            canAlignWithTeamObjectives: true,
          });
          setIsLoading(false);
          return;
        }
        
        // Check the basic create objective permission
        const { data: canCreateObj } = await supabase.rpc('check_okr_create_permission', {
          p_user_id: userId,
          p_permission_type: 'create_objectives',
        });
        
        // Check visibility-specific permissions for creating objectives
        const { data: canCreateOrg } = await supabase.rpc('check_okr_create_permission', {
          p_user_id: userId,
          p_permission_type: 'create_objectives',
          p_visibility: 'organization',
        });
        
        const { data: canCreateDept } = await supabase.rpc('check_okr_create_permission', {
          p_user_id: userId,
          p_permission_type: 'create_objectives',
          p_visibility: 'department',
        });
        
        const { data: canCreateTeam } = await supabase.rpc('check_okr_create_permission', {
          p_user_id: userId,
          p_permission_type: 'create_objectives',
          p_visibility: 'team',
        });
        
        // Check key results permission
        const { data: canCreateKR } = await supabase.rpc('check_okr_create_permission', {
          p_user_id: userId,
          p_permission_type: 'create_key_results',
        });
        
        // Check alignments permissions
        const { data: canCreateAlign } = await supabase.rpc('check_okr_create_permission', {
          p_user_id: userId,
          p_permission_type: 'create_alignments',
        });
        
        // Check alignment visibility permissions
        const { data: canAlignOrg } = await supabase.rpc('check_okr_create_permission', {
          p_user_id: userId,
          p_permission_type: 'create_alignments',
          p_visibility: 'organization',
        });
        
        const { data: canAlignDept } = await supabase.rpc('check_okr_create_permission', {
          p_user_id: userId,
          p_permission_type: 'create_alignments',
          p_visibility: 'department',
        });
        
        const { data: canAlignTeam } = await supabase.rpc('check_okr_create_permission', {
          p_user_id: userId,
          p_permission_type: 'create_alignments',
          p_visibility: 'team',
        });
        
        setPermissions({
          canCreateObjectives: !!canCreateObj,
          canCreateOrgObjectives: !!canCreateOrg,
          canCreateDeptObjectives: !!canCreateDept,
          canCreateTeamObjectives: !!canCreateTeam,
          canCreateKeyResults: !!canCreateKR,
          canCreateAlignments: !!canCreateAlign,
          canAlignWithOrgObjectives: !!canAlignOrg,
          canAlignWithDeptObjectives: !!canAlignDept,
          canAlignWithTeamObjectives: !!canAlignTeam,
        });
      } catch (error) {
        console.error('Error checking OKR permissions:', error);
        toast({
          variant: 'destructive',
          title: 'Permission Error',
          description: 'Failed to check OKR permissions. Please try again later.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkPermissions();
  }, [userId, isAdmin, toast]);
  
  const canCreateObjectiveWithVisibility = (visibility: ObjectiveVisibility): boolean => {
    if (isAdmin) return true;
    
    switch (visibility) {
      case 'organization':
        return permissions.canCreateOrgObjectives;
      case 'department':
        return permissions.canCreateDeptObjectives;
      case 'team':
        return permissions.canCreateTeamObjectives;
      case 'private':
        return permissions.canCreateObjectives;
      default:
        return false;
    }
  };
  
  const canAlignWithVisibility = (visibility: ObjectiveVisibility): boolean => {
    if (isAdmin) return true;
    
    switch (visibility) {
      case 'organization':
        return permissions.canAlignWithOrgObjectives;
      case 'department':
        return permissions.canAlignWithDeptObjectives;
      case 'team':
        return permissions.canAlignWithTeamObjectives;
      case 'private':
        return permissions.canCreateAlignments;
      default:
        return false;
    }
  };
  
  const isObjectiveOwner = async (objectiveId: string): Promise<boolean> => {
    if (!userId) return false;
    if (isAdmin) return true;
    
    try {
      const { data, error } = await supabase.rpc('check_objective_owner_permission', {
        p_user_id: userId,
        p_objective_id: objectiveId
      });
      
      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking objective ownership:', error);
      return false;
    }
  };
  
  return {
    canCreateObjectives: permissions.canCreateObjectives || isAdmin,
    canCreateObjectiveWithVisibility,
    canCreateKeyResults: permissions.canCreateKeyResults || isAdmin,
    canCreateAlignments: permissions.canCreateAlignments || isAdmin,
    canAlignWithVisibility,
    isObjectiveOwner,
    isLoading
  };
};
