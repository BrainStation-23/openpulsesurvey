
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, X, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface UserSelectorProps {
  selectedUsers: string[];
  onChange: (users: string[]) => void;
  placeholder?: string;
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

export const UserSelector = ({ selectedUsers, onChange, placeholder = "Search users..." }: UserSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  
  const { data: users, isLoading } = useQuery({
    queryKey: ['searchUsers', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) return [];
      
      // Call the database function to search users
      const { data, error } = await supabase.rpc(
        'search_users',
        { search_term: searchQuery }
      );
      
      if (error) {
        console.error('Error searching users:', error);
        throw error;
      }
      
      console.log('Search users result:', data);
      return data as UserProfile[];
    },
    enabled: searchQuery.trim().length >= 2,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
  
  const { data: selectedUserDetails } = useQuery({
    queryKey: ['userDetails', selectedUsers],
    queryFn: async () => {
      if (!selectedUsers.length) return [];
      
      // Get details for selected users
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', selectedUsers);
        
      if (error) {
        console.error('Error fetching selected user details:', error);
        throw error;
      }
      
      return data.map(user => ({
        id: user.id,
        full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
        email: user.email
      })) as UserProfile[];
    },
    enabled: selectedUsers.length > 0
  });
  
  const handleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      onChange(selectedUsers.filter(id => id !== userId));
    } else {
      onChange([...selectedUsers, userId]);
      setSearchQuery('');
    }
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
              if (e.target.value.trim().length >= 2) {
                setShowResults(true);
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (searchQuery.trim().length >= 2) {
                setShowResults(true);
              }
            }}
          />
        </div>
        
        {showResults && searchQuery.trim().length >= 2 && (
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
                  {users && users.length > 0 ? (
                    users.map(user => (
                      <div 
                        key={user.id}
                        className={`p-2 cursor-pointer hover:bg-accent flex items-center justify-between ${
                          selectedUsers.includes(user.id) ? 'bg-secondary/50' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectUser(user.id);
                        }}
                      >
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{user.full_name}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                          </div>
                        </div>
                        {selectedUsers.includes(user.id) && (
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
                      {searchQuery.trim().length >= 2 ? 'No users found' : 'Type at least 2 characters to search'}
                    </div>
                  )}
                </>
              )}
            </ScrollArea>
          </div>
        )}
      </div>
      
      {/* Selected users badges */}
      {selectedUserDetails && selectedUserDetails.length > 0 && (
        <div className="flex flex-wrap gap-1.5 py-2">
          {selectedUserDetails.map(user => (
            <Badge 
              key={user.id} 
              variant="secondary"
              className="flex items-center gap-1 py-1.5 px-2"
            >
              <span>{user.full_name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-secondary"
                onClick={() => handleSelectUser(user.id)}
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
