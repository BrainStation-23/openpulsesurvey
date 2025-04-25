
import React, { useState, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { useEmployeeRoles } from '@/hooks/useEmployeeRoles';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MultiRoleSelectorProps {
  selectedRoleIds: string[];
  onChange: (roleIds: string[]) => void;
  disabled?: boolean;
}

export function MultiRoleSelector({ 
  selectedRoleIds, 
  onChange, 
  disabled = false 
}: MultiRoleSelectorProps) {
  const { employeeRoles, loading, error } = useEmployeeRoles();
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggleRole = (roleId: string) => {
    if (disabled) return;
    
    const newSelectedRoles = selectedRoleIds.includes(roleId)
      ? selectedRoleIds.filter(id => id !== roleId)
      : [...selectedRoleIds, roleId];
    
    onChange(newSelectedRoles);
  };

  const handleSelectAll = () => {
    if (disabled || !employeeRoles) return;
    onChange(employeeRoles.map(role => role.id));
  };

  const handleClearAll = () => {
    if (disabled) return;
    onChange([]);
  };

  const filteredRoles = useMemo(() => {
    if (!employeeRoles) return [];
    
    return employeeRoles.filter(role => 
      role.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [employeeRoles, searchQuery]);

  if (error) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-md">
        <p className="text-sm text-red-600">
          Error loading roles: {error.message || "Failed to load employee roles."}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
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
    <div className="space-y-4">
      <div className="flex items-center gap-2 border rounded-md p-2 bg-slate-50">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search roles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
          disabled={disabled}
        />
      </div>

      <div className="flex justify-between items-center pb-2">
        <div className="text-sm font-medium">
          {selectedRoleIds.length > 0 ? (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
              {selectedRoleIds.length} {selectedRoleIds.length === 1 ? 'role' : 'roles'} selected
            </Badge>
          ) : (
            <span className="text-muted-foreground">No roles selected</span>
          )}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSelectAll}
            className={`text-xs text-blue-600 hover:text-blue-800 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            type="button"
            disabled={disabled}
          >
            Select All
          </button>
          <span className="text-gray-300">|</span>
          <button 
            onClick={handleClearAll}
            className={`text-xs text-blue-600 hover:text-blue-800 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            type="button"
            disabled={disabled}
          >
            Clear All
          </button>
        </div>
      </div>

      <ScrollArea className={`h-[240px] border rounded-md p-2 bg-white ${disabled ? 'opacity-75' : ''}`}>
        <div className="space-y-3 p-2">
          {filteredRoles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No roles match your search
            </p>
          ) : (
            filteredRoles.map(role => {
              const isChecked = selectedRoleIds.includes(role.id);
              return (
                <div 
                  key={role.id} 
                  className={`flex items-center space-x-2 p-2 rounded-md ${
                    isChecked ? 'bg-blue-50' : 'hover:bg-slate-50'
                  } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={() => handleToggleRole(role.id)}
                >
                  <Checkbox
                    id={`role-${role.id}`}
                    checked={isChecked}
                    onCheckedChange={() => handleToggleRole(role.id)}
                    disabled={disabled}
                  />
                  <Label
                    htmlFor={`role-${role.id}`}
                    className={`text-sm font-normal w-full ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {role.name}
                    {role.color_code && (
                      <span
                        className="inline-block w-3 h-3 rounded-full ml-2"
                        style={{ backgroundColor: role.color_code }}
                      />
                    )}
                  </Label>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
