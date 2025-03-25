
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export type PermissionRole = 'view' | 'edit' | 'comment';

export interface ObjectivePermission {
  id: string;
  objectiveId: string;
  userIds: string[];
  sbuIds: string[];
  employeeRoleIds: string[];
  canView: boolean;
  canEdit: boolean;
  canComment: boolean;
  createdBy: string;
  createdAt: string; // Changed from Date to string for consistency with Supabase
  updatedAt: string; // Changed from Date to string for consistency with Supabase
}

export interface PermissionFormValues {
  userIds: string[];
  sbuIds: string[];
  employeeRoleIds: string[];
  canView: boolean;
  canEdit: boolean;
  canComment: boolean;
}

export const useObjectivePermissions = (objectiveId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userId, isAdmin } = useCurrentUser();
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);

  const { data: permissions, isLoading } = useQuery({
    queryKey: ['objective-permissions', objectiveId],
    queryFn: async () => {
      if (!objectiveId) return null;
      
      const { data, error } = await supabase
        .from('okr_permissions')
        .select('*')
        .eq('objective_id', objectiveId);
        
      if (error) throw error;
      
      return data.map(permission => ({
        id: permission.id,
        objectiveId: permission.objective_id,
        userIds: permission.user_ids || [],
        sbuIds: permission.sbu_ids || [],
        employeeRoleIds: permission.employee_role_ids || [],
        canView: permission.can_view,
        canEdit: permission.can_edit,
        canComment: permission.can_comment,
        createdBy: permission.created_by,
        createdAt: permission.created_at,
        updatedAt: permission.updated_at
      })) as ObjectivePermission[];
    },
    enabled: !!objectiveId
  });

  const checkAccess = async (permissionType: PermissionRole): Promise<boolean> => {
    if (!objectiveId || !userId) return false;
    if (isAdmin) return true; // Admins always have access
    
    setIsCheckingAccess(true);
    
    try {
      const { data, error } = await supabase.rpc(
        'check_okr_objective_access',
        { 
          p_user_id: userId,
          p_objective_id: objectiveId,
          p_access_type: permissionType
        }
      );
      
      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking objective access:', error);
      return false;
    } finally {
      setIsCheckingAccess(false);
    }
  };

  const createPermission = useMutation({
    mutationFn: async (values: PermissionFormValues) => {
      if (!objectiveId || !userId) {
        throw new Error('Missing required data for creating permission');
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
          created_by: userId
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Permission created',
        description: 'The permission has been created successfully.'
      });
      queryClient.invalidateQueries({ queryKey: ['objective-permissions', objectiveId] });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error creating permission',
        description: error.message
      });
    }
  });

  const updatePermission = useMutation({
    mutationFn: async ({ id, values }: { id: string, values: PermissionFormValues }) => {
      const { data, error } = await supabase
        .from('okr_permissions')
        .update({
          user_ids: values.userIds,
          sbu_ids: values.sbuIds,
          employee_role_ids: values.employeeRoleIds,
          can_view: values.canView,
          can_edit: values.canEdit,
          can_comment: values.canComment,
          updated_at: new Date().toISOString() // Convert Date to string for Supabase
        })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Permission updated',
        description: 'The permission has been updated successfully.'
      });
      queryClient.invalidateQueries({ queryKey: ['objective-permissions', objectiveId] });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error updating permission',
        description: error.message
      });
    }
  });

  const deletePermission = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('okr_permissions')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      toast({
        title: 'Permission deleted',
        description: 'The permission has been deleted successfully.'
      });
      queryClient.invalidateQueries({ queryKey: ['objective-permissions', objectiveId] });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error deleting permission',
        description: error.message
      });
    }
  });

  return {
    permissions,
    isLoading,
    isCheckingAccess,
    checkAccess,
    createPermission,
    updatePermission,
    deletePermission,
  };
};
