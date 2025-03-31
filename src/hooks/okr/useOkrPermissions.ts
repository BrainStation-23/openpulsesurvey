
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
  const [employeeRoleId, setEmployeeRoleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch user's employee role ID from their profile
  useEffect(() => {
    const fetchUserEmployeeRole = async () => {
      if (!user) return;
      
      try {
        console.log('Fetching employee role ID for user:', user.id);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('employee_role_id')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        // Extract employee role ID
        const roleId = data?.employee_role_id || null;
        console.log('User employee role ID fetched:', roleId);
        setEmployeeRoleId(roleId);
      } catch (error) {
        console.error('Error fetching user employee role ID:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserEmployeeRole();
  }, [user]);
  
  // Helper function to check if user's employee role is allowed for a specific permission
  const hasPermission = (permissionType: OkrPermissionType): boolean => {
    // Admin always has permission
    if (isAdmin) {
      console.log(`Permission ${permissionType}: true (user is admin)`);
      return true;
    }
    
    // When settings, user or employee role are still loading, default to no permission
    if (settingsLoading || isLoading || !employeeRoleId) {
      console.log(`Permission ${permissionType}: false (still loading or no employee role ID found)`);
      return false;
    }
    
    // When settings or user doesn't exist, default to no permission
    if (!settings || !user) {
      console.log(`Permission ${permissionType}: false (no settings or user)`);
      return false;
    }
    
    // Map permission type to the corresponding setting field
    const settingField = `can_${permissionType}` as keyof typeof settings;
    
    console.log(`Checking permission ${permissionType}`);
    console.log(`Settings field: ${settingField}`);
    console.log(`Allowed role IDs for this permission:`, settings[settingField]);
    console.log(`User employee role ID:`, employeeRoleId);
    
    // Get allowed roles for this permission
    const allowedRoleIds = settings[settingField] as string[] || [];
    
    // Check if the user's employee role ID is in the allowed roles
    const hasAccess = allowedRoleIds.includes(employeeRoleId);
    console.log(`Permission ${permissionType} granted:`, hasAccess);
    
    return hasAccess;
  };

  const permissions = {
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
  
  console.log('Final OKR permissions:', permissions);
  
  return permissions;
}
