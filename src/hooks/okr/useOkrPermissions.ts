
import { useState, useEffect } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { supabase } from '@/integrations/supabase/client';
import { useOkrRoles } from '@/hooks/okr/useOkrRoles';
import { OkrPermissionType } from '@/types/okr-settings';

interface OkrPermissions {
  canCreateObjectives: boolean;
  canCreateOrgObjectives: boolean;
  canCreateDeptObjectives: boolean;
  canCreateTeamObjectives: boolean;
  canCreateKeyResults: boolean;
  canCreateAlignments: boolean;
  canAlignWithOrgObjectives: boolean;
  canAlignWithDeptObjectives: boolean;
  canAlignWithTeamObjectives: boolean;
  isLoading: boolean;
}

export function useOkrPermissions(): OkrPermissions {
  const { user, isAdmin } = useCurrentUser();
  const { settings, loading: settingsLoading } = useOkrRoles();
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch user roles
  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        // Extract role names
        const roles = data?.map(r => r.role) || [];
        setUserRoles(roles);
      } catch (error) {
        console.error('Error fetching user roles:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserRoles();
  }, [user]);
  
  // Helper function to check if user role is allowed for a specific permission
  const hasPermission = (permissionType: OkrPermissionType): boolean => {
    // Admin always has permission
    if (isAdmin) return true;
    
    // When settings or user roles are still loading, default to no permission
    if (settingsLoading || isLoading) return false;
    
    // When settings or user doesn't exist, default to no permission
    if (!settings || !user) return false;
    
    // Map permission type to the corresponding setting field
    const settingField = `can_${permissionType}` as keyof typeof settings;
    
    // Get allowed roles for this permission
    const allowedRoles = settings[settingField] as string[] || [];
    
    // Check if any of the user's roles are in the allowed roles
    return userRoles.some(role => allowedRoles.includes(role));
  };
  
  return {
    canCreateObjectives: hasPermission('create_objectives'),
    canCreateOrgObjectives: hasPermission('create_org_objectives'),
    canCreateDeptObjectives: hasPermission('create_dept_objectives'),
    canCreateTeamObjectives: hasPermission('create_team_objectives'),
    canCreateKeyResults: hasPermission('create_key_results'),
    canCreateAlignments: hasPermission('create_alignments'),
    canAlignWithOrgObjectives: hasPermission('align_with_org_objectives'),
    canAlignWithDeptObjectives: hasPermission('align_with_dept_objectives'),
    canAlignWithTeamObjectives: hasPermission('align_with_team_objectives'),
    isLoading: settingsLoading || isLoading
  };
}
