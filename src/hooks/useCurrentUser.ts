
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useCurrentUser() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function getUserId() {
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        setUserId(user?.id || null);
        setError(null);
      } catch (err) {
        console.error('Error getting user:', err);
        setError(err instanceof Error ? err : new Error('Failed to get user'));
      } finally {
        setIsLoading(false);
      }
    }

    getUserId();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { userId, isLoading, error };
}
