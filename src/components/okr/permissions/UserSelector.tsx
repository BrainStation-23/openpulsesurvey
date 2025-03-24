
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

interface UserSelectorProps {
  selectedUsers: string[];
  onChange: (users: string[]) => void;
  placeholder?: string;
}

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

export const UserSelector = ({ selectedUsers, onChange, placeholder = "Select users..." }: UserSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: users, isLoading } = useQuery({
    queryKey: ['users', searchQuery],
    queryFn: async () => {
      // If we have a search query, filter by it
      const query = supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .order('first_name', { ascending: true });
        
      if (searchQuery) {
        query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query.limit(20);
      
      if (error) throw error;
      return data as UserProfile[];
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
  
  const { data: selectedUserDetails } = useQuery({
    queryKey: ['userDetails', selectedUsers],
    queryFn: async () => {
      if (!selectedUsers.length) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .in('id', selectedUsers);
        
      if (error) throw error;
      return data as UserProfile[];
    },
    enabled: selectedUsers.length > 0
  });
  
  const handleSelectUser = (userId: string) => {
    // If already selected, remove it, otherwise add it
    if (selectedUsers.includes(userId)) {
      onChange(selectedUsers.filter(id => id !== userId));
    } else {
      onChange([...selectedUsers, userId]);
    }
  };
  
  const getUserDisplayName = (user: UserProfile) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.email;
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
            {selectedUsers.length 
              ? `${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''} selected` 
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search users..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            {isLoading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Loading users...
              </div>
            ) : (
              <>
                <CommandEmpty>No users found.</CommandEmpty>
                <CommandGroup>
                  <ScrollArea className="h-72">
                    {users?.map((user) => (
                      <CommandItem
                        key={user.id}
                        value={user.id}
                        onSelect={() => handleSelectUser(user.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedUsers.includes(user.id) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span>{getUserDisplayName(user)}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </ScrollArea>
                </CommandGroup>
              </>
            )}
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Show selected users as badges */}
      {selectedUserDetails && selectedUserDetails.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedUserDetails.map(user => (
            <Badge 
              key={user.id} 
              variant="secondary"
              className="flex items-center gap-1"
            >
              {getUserDisplayName(user)}
              <button 
                className="ml-1 rounded-full hover:bg-muted p-0.5" 
                onClick={() => handleSelectUser(user.id)}
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
