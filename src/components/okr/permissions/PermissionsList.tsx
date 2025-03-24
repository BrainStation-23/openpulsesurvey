
import React, { useState } from 'react';
import { PermissionDialog } from './PermissionDialog';
import { Check, Edit, PlusCircle, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ObjectivePermission, PermissionFormValues, useObjectivePermissions } from '@/hooks/okr/useObjectivePermissions';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PermissionsListProps {
  objectiveId: string;
  canManagePermissions: boolean;
}

export const PermissionsList = ({ objectiveId, canManagePermissions }: PermissionsListProps) => {
  const { 
    permissions, 
    isLoading,
    createPermission,
    updatePermission,
    deletePermission
  } = useObjectivePermissions(objectiveId);
  
  const [permissionToEdit, setPermissionToEdit] = useState<ObjectivePermission | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<string | null>(null);
  
  // Fetch user names, SBU names, and employee role names based on IDs from permissions
  const { data: entityNames, isLoading: isEntityNamesLoading } = useQuery({
    queryKey: ['entityNames', permissions],
    queryFn: async () => {
      if (!permissions || permissions.length === 0) return { users: {}, sbus: {}, roles: {} };
      
      // Extract all unique IDs across all permissions
      const userIds = new Set<string>();
      const sbuIds = new Set<string>();
      const roleIds = new Set<string>();
      
      permissions.forEach(permission => {
        permission.userIds.forEach(id => userIds.add(id));
        permission.sbuIds.forEach(id => sbuIds.add(id));
        permission.employeeRoleIds.forEach(id => roleIds.add(id));
      });
      
      // Fetch user names
      let users = {};
      if (userIds.size > 0) {
        const { data: usersData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('id', Array.from(userIds));
        
        users = (usersData || []).reduce((acc, user) => {
          acc[user.id] = user.first_name && user.last_name 
            ? `${user.first_name} ${user.last_name}` 
            : user.email;
          return acc;
        }, {});
      }
      
      // Fetch SBU names
      let sbus = {};
      if (sbuIds.size > 0) {
        const { data: sbusData } = await supabase
          .from('sbus')
          .select('id, name')
          .in('id', Array.from(sbuIds));
        
        sbus = (sbusData || []).reduce((acc, sbu) => {
          acc[sbu.id] = sbu.name;
          return acc;
        }, {});
      }
      
      // Fetch role names
      let roles = {};
      if (roleIds.size > 0) {
        const { data: rolesData } = await supabase
          .from('employee_roles')
          .select('id, name')
          .in('id', Array.from(roleIds));
        
        roles = (rolesData || []).reduce((acc, role) => {
          acc[role.id] = role.name;
          return acc;
        }, {});
      }
      
      return { users, sbus, roles };
    },
    enabled: !isLoading && (permissions?.length || 0) > 0
  });
  
  const handleAddPermission = () => {
    setIsCreateDialogOpen(true);
  };
  
  const handleEditPermission = (permission: ObjectivePermission) => {
    setPermissionToEdit(permission);
  };
  
  const handleDeletePermission = (permissionId: string) => {
    setPermissionToDelete(permissionId);
  };
  
  const handleCreateSubmit = (values: PermissionFormValues) => {
    createPermission.mutate(values, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
      }
    });
  };
  
  const handleUpdateSubmit = (values: PermissionFormValues) => {
    if (!permissionToEdit) return;
    
    updatePermission.mutate({
      id: permissionToEdit.id,
      values
    }, {
      onSuccess: () => {
        setPermissionToEdit(null);
      }
    });
  };
  
  const handleConfirmDelete = () => {
    if (!permissionToDelete) return;
    
    deletePermission.mutate(permissionToDelete, {
      onSuccess: () => {
        setPermissionToDelete(null);
      }
    });
  };
  
  if (isLoading || isEntityNamesLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {canManagePermissions && (
        <div className="mb-6">
          <Button onClick={handleAddPermission}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Permission
          </Button>
        </div>
      )}
      
      {permissions?.length === 0 ? (
        <Card>
          <CardContent className="py-6">
            <div className="text-center text-muted-foreground">
              <p>No permissions have been set for this objective.</p>
              {canManagePermissions && (
                <p className="mt-2">Click "Add Permission" to start granting access.</p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {permissions?.map((permission) => (
            <Card key={permission.id}>
              <CardContent className="py-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-4 flex-1">
                    {/* Users section */}
                    {permission.userIds.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Users</h4>
                        <div className="flex flex-wrap gap-1">
                          {permission.userIds.map(userId => (
                            <Badge key={userId} variant="outline">
                              {entityNames?.users[userId] || 'Unknown user'}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* SBUs section */}
                    {permission.sbuIds.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Business Units</h4>
                        <div className="flex flex-wrap gap-1">
                          {permission.sbuIds.map(sbuId => (
                            <Badge key={sbuId} variant="outline">
                              {entityNames?.sbus[sbuId] || 'Unknown SBU'}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Employee roles section */}
                    {permission.employeeRoleIds.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Employee Roles</h4>
                        <div className="flex flex-wrap gap-1">
                          {permission.employeeRoleIds.map(roleId => (
                            <Badge key={roleId} variant="outline">
                              {entityNames?.roles[roleId] || 'Unknown role'}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Permissions section */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Access Level</h4>
                      <div className="flex gap-2">
                        {permission.canView && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            View
                          </Badge>
                        )}
                        {permission.canEdit && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Edit
                          </Badge>
                        )}
                        {permission.canComment && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Comment
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {canManagePermissions && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPermission(permission)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePermission(permission.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <PermissionDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateSubmit}
        isSubmitting={createPermission.isPending}
        title="Add Permission"
      />
      
      {permissionToEdit && (
        <PermissionDialog
          open={true}
          onClose={() => setPermissionToEdit(null)}
          onSubmit={handleUpdateSubmit}
          initialValues={{
            userIds: permissionToEdit.userIds,
            sbuIds: permissionToEdit.sbuIds,
            employeeRoleIds: permissionToEdit.employeeRoleIds,
            canView: permissionToEdit.canView,
            canEdit: permissionToEdit.canEdit,
            canComment: permissionToEdit.canComment
          }}
          isSubmitting={updatePermission.isPending}
          title="Edit Permission"
        />
      )}
      
      <AlertDialog open={!!permissionToDelete} onOpenChange={() => setPermissionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the permission settings for all associated users and groups.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
