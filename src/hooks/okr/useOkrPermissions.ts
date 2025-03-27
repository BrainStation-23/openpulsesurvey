
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type OkrPermissionType = 
  | 'create_objectives'
  | 'create_org_objectives'
  | 'create_dept_objectives'
  | 'create_team_objectives'
  | 'create_key_results'
  | 'create_alignments'
  | 'align_with_org_objectives'
  | 'align_with_dept_objectives'
  | 'align_with_team_objectives';

export function useOkrPermissions() {
  const [permissions, setPermissions] = useState<Record<OkrPermissionType, boolean>>({
    create_objectives: false,
    create_org_objectives: false,
    create_dept_objectives: false,
    create_team_objectives: false,
    create_key_results: false,
    create_alignments: false,
    align_with_org_objectives: false,
    align_with_dept_objectives: false,
    align_with_team_objectives: false
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          setCurrentUserId(user.user.id);
          return user.user.id;
        }
        return null;
      } catch (error) {
        console.error('Error fetching user:', error);
        return null;
      }
    }

    async function checkAdminStatus() {
      try {
        const userId = await fetchCurrentUser();
        if (!userId) return;
        
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .single();
        
        if (data && data.role === 'admin') {
          setIsAdmin(true);
          // Admins have all permissions
          setPermissions({
            create_objectives: true,
            create_org_objectives: true,
            create_dept_objectives: true,
            create_team_objectives: true,
            create_key_results: true,
            create_alignments: true,
            align_with_org_objectives: true,
            align_with_dept_objectives: true,
            align_with_team_objectives: true
          });
        } else {
          // Fetch individual permissions for non-admin users
          await fetchUserPermissions(userId);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setLoading(false);
      }
    }
    
    checkAdminStatus();
  }, []);

  async function fetchUserPermissions(userId: string) {
    if (!userId) return;
    
    try {
      // Check generic permission to create objectives
      const { data: canCreateObjectives } = await supabase.rpc(
        'check_user_has_permission',
        { 
          p_user_id: userId,
          p_permission_type: 'create_objectives',
          p_visibility: null
        }
      );
      
      // Check permission to create org-level objectives
      const { data: canCreateOrgObjectives } = await supabase.rpc(
        'check_user_has_permission',
        { 
          p_user_id: userId,
          p_permission_type: 'create_objectives',
          p_visibility: 'organization'
        }
      );
      
      // Check permission to create dept-level objectives
      const { data: canCreateDeptObjectives } = await supabase.rpc(
        'check_user_has_permission',
        { 
          p_user_id: userId,
          p_permission_type: 'create_objectives',
          p_visibility: 'department'
        }
      );
      
      // Check permission to create team-level objectives
      const { data: canCreateTeamObjectives } = await supabase.rpc(
        'check_user_has_permission',
        { 
          p_user_id: userId,
          p_permission_type: 'create_objectives',
          p_visibility: 'team'
        }
      );
      
      // Check permission to create key results
      const { data: canCreateKeyResults } = await supabase.rpc(
        'check_user_has_permission',
        { 
          p_user_id: userId,
          p_permission_type: 'create_key_results',
          p_visibility: null
        }
      );
      
      // Check permission to create alignments
      const { data: canCreateAlignments } = await supabase.rpc(
        'check_user_has_permission',
        { 
          p_user_id: userId,
          p_permission_type: 'create_alignments',
          p_visibility: null
        }
      );
      
      // Check permission to align with org-level objectives
      const { data: canAlignWithOrgObjectives } = await supabase.rpc(
        'check_user_has_permission',
        { 
          p_user_id: userId,
          p_permission_type: 'create_alignments',
          p_visibility: 'organization'
        }
      );
      
      // Check permission to align with dept-level objectives
      const { data: canAlignWithDeptObjectives } = await supabase.rpc(
        'check_user_has_permission',
        { 
          p_user_id: userId,
          p_permission_type: 'create_alignments',
          p_visibility: 'department'
        }
      );
      
      // Check permission to align with team-level objectives
      const { data: canAlignWithTeamObjectives } = await supabase.rpc(
        'check_user_has_permission',
        { 
          p_user_id: userId,
          p_permission_type: 'create_alignments',
          p_visibility: 'team'
        }
      );
      
      setPermissions({
        create_objectives: canCreateObjectives || false,
        create_org_objectives: canCreateOrgObjectives || false,
        create_dept_objectives: canCreateDeptObjectives || false,
        create_team_objectives: canCreateTeamObjectives || false,
        create_key_results: canCreateKeyResults || false,
        create_alignments: canCreateAlignments || false,
        align_with_org_objectives: canAlignWithOrgObjectives || false,
        align_with_dept_objectives: canAlignWithDeptObjectives || false,
        align_with_team_objectives: canAlignWithTeamObjectives || false
      });
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch permissions',
        variant: 'destructive',
      });
    }
  }
  
  // Check if user is the owner of an objective
  async function checkIsObjectiveOwner(objectiveId: string): Promise<boolean> {
    try {
      if (isAdmin) return true;
      if (!currentUserId) return false;
      
      const { data: isOwner } = await supabase.rpc(
        'check_user_is_owner',
        { 
          p_user_id: currentUserId,
          p_objective_id: objectiveId
        }
      );
      
      return isOwner || false;
    } catch (error) {
      console.error('Error checking objective ownership:', error);
      return false;
    }
  }

  // Helper method to check if user can create objectives with specific visibility
  function canCreateObjectiveWithVisibility(visibility: string): boolean {
    if (isAdmin) return true;
    
    switch(visibility) {
      case 'organization':
        return permissions.create_org_objectives;
      case 'department':
        return permissions.create_dept_objectives;
      case 'team':
        return permissions.create_team_objectives;
      default:
        return permissions.create_objectives;
    }
  }

  return {
    permissions,
    isAdmin,
    isLoading: loading,
    canCreateObjectives: permissions.create_objectives,
    canCreateKeyResults: permissions.create_key_results,
    canCreateAlignments: permissions.create_alignments,
    canCreateObjectiveWithVisibility,
    isObjectiveOwner: checkIsObjectiveOwner
  };
}
