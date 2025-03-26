
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
}

export function useCurrentUser() {
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function getUserInfo() {
      try {
        setIsLoading(true);
        // Get user session
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (!authUser) {
          setUserId(null);
          setUser(null);
          setIsAdmin(false);
          return;
        }
        
        setUserId(authUser.id);
        
        // Get user profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
          
        if (profileError) {
          throw profileError;
        }
        
        // Set user information
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          first_name: profileData?.first_name,
          last_name: profileData?.last_name,
          profile_image_url: profileData?.profile_image_url
        });
        
        // Check if user is admin
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', authUser.id)
          .single();
          
        if (!roleError && roleData) {
          setIsAdmin(roleData.role === 'admin');
        }
        
        setError(null);
      } catch (err) {
        console.error('Error getting user:', err);
        setError(err instanceof Error ? err : new Error('Failed to get user'));
      } finally {
        setIsLoading(false);
      }
    }

    getUserInfo();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        getUserInfo();
      } else {
        setUserId(null);
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { userId, user, isAdmin, isLoading, error };
}
