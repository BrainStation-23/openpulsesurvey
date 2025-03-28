
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { useEmployeeRoles } from '@/hooks/useEmployeeRoles';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';

interface MultiRoleSelectorProps {
  selectedRoleIds: string[];
  onChange: (roleIds: string[]) => void;
}

export function MultiRoleSelector({ selectedRoleIds, onChange }: MultiRoleSelectorProps) {
  const { employeeRoles, loading } = useEmployeeRoles();

  const handleToggleRole = (roleId: string) => {
    const newSelectedRoles = selectedRoleIds.includes(roleId)
      ? selectedRoleIds.filter(id => id !== roleId)
      : [...selectedRoleIds, roleId];
    
    onChange(newSelectedRoles);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    );
  }

  if (!employeeRoles || employeeRoles.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No employee roles are configured in the system. Please create employee roles first.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium mb-2">Select Roles</div>
      {employeeRoles.map(role => (
        <div key={role.id} className="flex items-center space-x-2">
          <Checkbox
            id={`role-${role.id}`}
            checked={selectedRoleIds.includes(role.id)}
            onCheckedChange={() => handleToggleRole(role.id)}
          />
          <Label
            htmlFor={`role-${role.id}`}
            className="text-sm font-normal cursor-pointer"
          >
            {role.name}
          </Label>
        </div>
      ))}
    </div>
  );
}
