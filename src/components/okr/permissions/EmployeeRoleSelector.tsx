
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, X, UserCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface EmployeeRoleSelectorProps {
  selectedRoles: string[];
  onChange: (roles: string[]) => void;
  placeholder?: string;
}

interface EmployeeRole {
  id: string;
  name: string;
}

export const EmployeeRoleSelector = ({ 
  selectedRoles, 
  onChange, 
  placeholder = "Search employee roles..." 
}: EmployeeRoleSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  
  const { data: roles, isLoading } = useQuery({
    queryKey: ['employeeRoles', searchQuery],
    queryFn: async () => {
      const query = supabase
        .from('employee_roles')
        .select('id, name')
        .order('name', { ascending: true });
        
      if (searchQuery) {
        query.ilike('name', `%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as EmployeeRole[];
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
  
  const { data: selectedRoleDetails } = useQuery({
    queryKey: ['employeeRoleDetails', selectedRoles],
    queryFn: async () => {
      if (!selectedRoles.length) return [];
      
      const { data, error } = await supabase
        .from('employee_roles')
        .select('id, name')
        .in('id', selectedRoles);
        
      if (error) throw error;
      return data as EmployeeRole[];
    },
    enabled: selectedRoles.length > 0
  });
  
  const handleSelectRole = (roleId: string) => {
    if (selectedRoles.includes(roleId)) {
      onChange(selectedRoles.filter(id => id !== roleId));
    } else {
      onChange([...selectedRoles, roleId]);
      setSearchQuery('');
    }
  };

  const handleSelectAllRoles = (e: React.MouseEvent) => {
    e.preventDefault();
    if (roles && roles.length > 0) {
      onChange(roles.map(role => role.id));
    }
  };

  const handleClearAllRoles = (e: React.MouseEvent) => {
    e.preventDefault();
    onChange([]);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setShowResults(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder}
            className="pl-9 pr-4"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onClick={(e) => {
              e.stopPropagation();
              setShowResults(true);
            }}
          />
        </div>
        
        {/* Selection Controls */}
        <div className="mt-2 flex justify-between items-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSelectAllRoles}
            className="text-xs h-7 px-2"
          >
            Select All
          </Button>
          {selectedRoles.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAllRoles}
              className="text-xs h-7 px-2"
            >
              Clear All
            </Button>
          )}
        </div>
        
        {showResults && (
          <div className="absolute w-full mt-1 bg-card border rounded-md shadow-md z-50">
            <ScrollArea className="h-[200px]">
              {isLoading ? (
                <div className="p-2 space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <>
                  {roles && roles.length > 0 ? (
                    roles.map(role => (
                      <div 
                        key={role.id}
                        className={`p-2 cursor-pointer hover:bg-accent flex items-center justify-between ${
                          selectedRoles.includes(role.id) ? 'bg-secondary/50' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectRole(role.id);
                        }}
                      >
                        <div className="flex items-center">
                          <UserCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{role.name}</span>
                        </div>
                        {selectedRoles.includes(role.id) && (
                          <div className="text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6 9 17l-5-5"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      {searchQuery.trim() ? 'No employee roles found' : 'Type to search employee roles'}
                    </div>
                  )}
                </>
              )}
            </ScrollArea>
          </div>
        )}
      </div>
      
      {/* Selected roles badges */}
      {selectedRoleDetails && selectedRoleDetails.length > 0 && (
        <div className="flex flex-wrap gap-1.5 py-2">
          {selectedRoleDetails.map(role => (
            <Badge 
              key={role.id} 
              variant="secondary"
              className="flex items-center gap-1 py-1.5 px-2"
            >
              <span>{role.name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-secondary"
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectRole(role.id);
                }}
                type="button"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove</span>
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
