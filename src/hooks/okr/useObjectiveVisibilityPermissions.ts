
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from '@/hooks/useCurrentUser';

type VisibilityPermissions = {
  canCreateTeam: boolean;
  canCreateDepartment: boolean;
  canCreateOrganization: boolean;
  isLoading: boolean;
};

export function useObjectiveVisibilityPermissions() {
  const { userId } = useCurrentUser();
  const [permissions, setPermissions] = useState<VisibilityPermissions>({
    canCreateTeam: false,
    canCreateDepartment: false,
    canCreateOrganization: false,
    isLoading: true,
  });

  const { data: teamPermission, isLoading: teamLoading } = useQuery({
    queryKey: ['objective-visibility-permission', userId, 'team'],
    queryFn: async () => {
      if (!userId) return false;
      
      const { data, error } = await supabase.rpc('can_create_objective_by_visibility', {
        p_user_id: userId,
        p_visibility: 'team'
      });

      if (error) {
        console.error('Error checking team permission:', error);
        return false;
      }
      
      return !!data;
    },
    enabled: !!userId
  });

  const { data: departmentPermission, isLoading: departmentLoading } = useQuery({
    queryKey: ['objective-visibility-permission', userId, 'department'],
    queryFn: async () => {
      if (!userId) return false;
      
      const { data, error } = await supabase.rpc('can_create_objective_by_visibility', {
        p_user_id: userId,
        p_visibility: 'department'
      });

      if (error) {
        console.error('Error checking department permission:', error);
        return false;
      }
      
      return !!data;
    },
    enabled: !!userId
  });

  const { data: organizationPermission, isLoading: organizationLoading } = useQuery({
    queryKey: ['objective-visibility-permission', userId, 'organization'],
    queryFn: async () => {
      if (!userId) return false;
      
      const { data, error } = await supabase.rpc('can_create_objective_by_visibility', {
        p_user_id: userId,
        p_visibility: 'organization'
      });

      if (error) {
        console.error('Error checking organization permission:', error);
        return false;
      }
      
      return !!data;
    },
    enabled: !!userId
  });

  useEffect(() => {
    setPermissions({
      canCreateTeam: teamPermission || false,
      canCreateDepartment: departmentPermission || false,
      canCreateOrganization: organizationPermission || false,
      isLoading: teamLoading || departmentLoading || organizationLoading
    });
  }, [teamPermission, departmentPermission, organizationPermission, teamLoading, departmentLoading, organizationLoading]);

  return permissions;
}
