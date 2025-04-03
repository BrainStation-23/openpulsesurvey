
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MentionableUser {
  id: string;
  username: string;
  fullName: string;
  avatar?: string;
}

export const useMentionableUsers = (query: string = '') => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  
  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query]);

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['mentionable-users', debouncedQuery],
    queryFn: async (): Promise<MentionableUser[]> => {
      // Only fetch if there's a query or empty query but we want to show all users
      if (debouncedQuery !== '' || debouncedQuery === '') {
        let query = supabase
          .from('profiles')
          .select(`
            id,
            email,
            first_name,
            last_name,
            profile_image_url
          `)
          .order('first_name', { ascending: true });
          
        // Filter by name or email if we have a query
        if (debouncedQuery) {
          query = query.or(`first_name.ilike.%${debouncedQuery}%,last_name.ilike.%${debouncedQuery}%,email.ilike.%${debouncedQuery}%`);
        }
        
        // Limit to 10 results
        query = query.limit(10);
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching users for mentions:", error);
          return [];
        }
        
        return data.map(user => ({
          id: user.id,
          username: user.email.split('@')[0], // Use the part before @ as username
          fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
          avatar: user.profile_image_url
        }));
      }
      
      return [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: true
  });

  return {
    users: users || [],
    isLoading,
    error
  };
};
