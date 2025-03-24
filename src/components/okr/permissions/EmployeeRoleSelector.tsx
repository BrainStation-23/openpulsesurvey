
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

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
  placeholder = "Select employee roles..." 
}: EmployeeRoleSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: roles, isLoading } = useQuery({
    queryKey: ['employeeRoles', searchQuery],
    queryFn: async () => {
      const query = supabase
        .from('employee_roles')
        .select('id, name')
        .eq('status', 'active')
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
    }
  };
  
  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedRoles.length 
              ? `${selectedRoles.length} role${selectedRoles.length > 1 ? 's' : ''} selected` 
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search employee roles..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            {isLoading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Loading employee roles...
              </div>
            ) : (
              <>
                <CommandEmpty>No employee roles found.</CommandEmpty>
                <CommandGroup>
                  <ScrollArea className="h-72">
                    {roles?.map((role) => (
                      <CommandItem
                        key={role.id}
                        value={role.id}
                        onSelect={() => handleSelectRole(role.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedRoles.includes(role.id) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {role.name}
                      </CommandItem>
                    ))}
                  </ScrollArea>
                </CommandGroup>
              </>
            )}
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Show selected roles as badges */}
      {selectedRoleDetails && selectedRoleDetails.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedRoleDetails.map(role => (
            <Badge 
              key={role.id} 
              variant="secondary"
              className="flex items-center gap-1"
            >
              {role.name}
              <button 
                className="ml-1 rounded-full hover:bg-muted p-0.5" 
                onClick={() => handleSelectRole(role.id)}
              >
                <span className="sr-only">Remove</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
