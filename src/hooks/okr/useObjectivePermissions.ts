
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Define types needed by permission components
export interface PermissionFormValues {
  userIds: string[];
  sbuIds: string[];
  employeeRoleIds: string[];
  canView: boolean;
  canEdit: boolean;
  canComment: boolean;
}

export interface ObjectivePermission extends PermissionFormValues {
  id: string;
  objectiveId: string;
  createdAt: string;
  createdBy: string;
}

export function useObjectivePermissions(objectiveId?: string) {
  const [canCreateObjective, setCanCreateObjective] = useState(false);
  const [permissions, setPermissions] = useState<ObjectivePermission[]>([]);
  
  // Query to check if user can create objectives
  const { data, isLoading: permissionsLoading } = useQuery({
    queryKey: ['objective-permissions'],
    queryFn: async () => {
      try {
        // Call the can_create_objective function we created in the database
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) {
          return { canCreate: false };
        }

        const { data, error } = await supabase.rpc('can_create_objective', {
          p_user_id: session.session.user.id
        });
        
        if (error) {
          console.error('Error checking objective permissions:', error);
          return { canCreate: false };
        }
        
        return { canCreate: !!data }; // Convert to boolean explicitly
      } catch (err) {
        console.error('Failed to check objective permissions:', err);
        return { canCreate: false };
      }
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
  
  // Update state when query completes
  useEffect(() => {
    if (data) {
      setCanCreateObjective(Boolean(data.canCreate));
    }
  }, [data]);
  
  // Fetch permissions for a specific objective if objectiveId is provided
  const { data: permissionsData, isLoading: permissionsDataLoading } = useQuery({
    queryKey: ['objective-permissions', objectiveId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('okr_permissions')
          .select('*')
          .eq('objective_id', objectiveId);
          
        if (error) {
          console.error('Error fetching objective permissions:', error);
          return [];
        }
        
        // Transform to match our ObjectivePermission interface
        return data.map(p => ({
          id: p.id,
          objectiveId: p.objective_id,
          userIds: p.user_ids || [],
          sbuIds: p.sbu_ids || [],
          employeeRoleIds: p.employee_role_ids || [],
          canView: p.can_view,
          canEdit: p.can_edit,
          canComment: p.can_comment,
          createdAt: p.created_at,
          createdBy: p.created_by
        }));
      } catch (err) {
        console.error('Failed to fetch objective permissions:', err);
        return [];
      }
    },
    enabled: !!objectiveId,
    staleTime: 60 * 1000 // 1 minute
  });
  
  // Update permissions state when data is fetched
  useEffect(() => {
    if (permissionsData) {
      setPermissions(permissionsData);
    }
  }, [permissionsData]);
  
  // Mutations for creating, updating, and deleting permissions
  const createPermission = {
    mutate: async (values: PermissionFormValues, options?: any) => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) {
          throw new Error('User not authenticated');
        }
        
        const { data, error } = await supabase
          .from('okr_permissions')
          .insert({
            objective_id: objectiveId,
            user_ids: values.userIds,
            sbu_ids: values.sbuIds,
            employee_role_ids: values.employeeRoleIds,
            can_view: values.canView,
            can_edit: values.canEdit,
            can_comment: values.canComment,
            created_by: session.session.user.id
          })
          .select();
          
        if (error) {
          console.error('Error creating permission:', error);
          options?.onError?.(error);
          return null;
        }
        
        // Refresh permissions
        const newPermission = {
          id: data[0].id,
          objectiveId: data[0].objective_id,
          userIds: data[0].user_ids || [],
          sbuIds: data[0].sbu_ids || [],
          employeeRoleIds: data[0].employee_role_ids || [],
          canView: data[0].can_view,
          canEdit: data[0].can_edit,
          canComment: data[0].can_comment,
          createdAt: data[0].created_at,
          createdBy: data[0].created_by
        };
        
        setPermissions(prev => [...prev, newPermission]);
        options?.onSuccess?.(newPermission);
        return newPermission;
      } catch (err) {
        console.error('Failed to create permission:', err);
        options?.onError?.(err);
        return null;
      }
    },
    isPending: false
  };
  
  const updatePermission = {
    mutate: async ({ id, values }: { id: string, values: PermissionFormValues }, options?: any) => {
      try {
        const { data, error } = await supabase
          .from('okr_permissions')
          .update({
            user_ids: values.userIds,
            sbu_ids: values.sbuIds,
            employee_role_ids: values.employeeRoleIds,
            can_view: values.canView,
            can_edit: values.canEdit,
            can_comment: values.canComment
          })
          .eq('id', id)
          .select();
          
        if (error) {
          console.error('Error updating permission:', error);
          options?.onError?.(error);
          return null;
        }
        
        // Update permissions state
        const updatedPermission = {
          id: data[0].id,
          objectiveId: data[0].objective_id,
          userIds: data[0].user_ids || [],
          sbuIds: data[0].sbu_ids || [],
          employeeRoleIds: data[0].employee_role_ids || [],
          canView: data[0].can_view,
          canEdit: data[0].can_edit,
          canComment: data[0].can_comment,
          createdAt: data[0].created_at,
          createdBy: data[0].created_by
        };
        
        setPermissions(prev => 
          prev.map(p => p.id === id ? updatedPermission : p)
        );
        options?.onSuccess?.(updatedPermission);
        return updatedPermission;
      } catch (err) {
        console.error('Failed to update permission:', err);
        options?.onError?.(err);
        return null;
      }
    },
    isPending: false
  };
  
  const deletePermission = {
    mutate: async (id: string, options?: any) => {
      try {
        const { error } = await supabase
          .from('okr_permissions')
          .delete()
          .eq('id', id);
          
        if (error) {
          console.error('Error deleting permission:', error);
          options?.onError?.(error);
          return false;
        }
        
        // Update permissions state
        setPermissions(prev => prev.filter(p => p.id !== id));
        options?.onSuccess?.();
        return true;
      } catch (err) {
        console.error('Failed to delete permission:', err);
        options?.onError?.(err);
        return false;
      }
    },
    isPending: false
  };
  
  return {
    canCreateObjective,
    isLoading: permissionsLoading,
    permissions,
    permissionsLoading: permissionsDataLoading,
    createPermission,
    updatePermission,
    deletePermission
  };
}
