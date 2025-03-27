
import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ObjectiveVisibility = 'private' | 'team' | 'department' | 'organization';

// Create a hook for OKR permissions
export const useOkrPermissions = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Check if user can create objectives (base permission)
  const canCreateObjectives = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Check if user is an admin (admins can always create)
      const adminCheck = await isAdmin();
      if (adminCheck) {
        setIsLoading(false);
        return true;
      }

      // Use the RPC to check permission
      const { data, error } = await supabase.rpc('check_user_has_permission', {
        permission_name: 'create_objectives'
      });

      if (error) {
        console.error('Error checking create objective permission:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in canCreateObjectives:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check if user can create objectives with specific visibility
  const canCreateObjectiveWithVisibility = useCallback(async (visibility: ObjectiveVisibility): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Check if user is an admin (admins can always create all visibilities)
      const adminCheck = await isAdmin();
      if (adminCheck) {
        setIsLoading(false);
        return true;
      }

      // Use the RPC to check visibility-specific permission
      const { data, error } = await supabase.rpc('check_user_has_permission', {
        permission_name: `create_${visibility}_objectives`
      });

      if (error) {
        console.error(`Error checking create ${visibility} objective permission:`, error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error(`Error in canCreateObjectiveWithVisibility for ${visibility}:`, error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check if user can create key results
  const canCreateKeyResults = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Check if user is an admin
      const adminCheck = await isAdmin();
      if (adminCheck) {
        setIsLoading(false);
        return true;
      }

      // Use the RPC to check permission
      const { data, error } = await supabase.rpc('check_user_has_permission', {
        permission_name: 'create_key_results'
      });

      if (error) {
        console.error('Error checking create key results permission:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in canCreateKeyResults:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check if user can create alignments
  const canCreateAlignments = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Check if user is an admin
      const adminCheck = await isAdmin();
      if (adminCheck) {
        setIsLoading(false);
        return true;
      }

      // Use the RPC to check permission
      const { data, error } = await supabase.rpc('check_user_has_permission', {
        permission_name: 'create_alignments'
      });

      if (error) {
        console.error('Error checking create alignments permission:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in canCreateAlignments:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check if user can align with objectives of a specific visibility
  const canAlignWithObjectiveVisibility = useCallback(async (visibility: ObjectiveVisibility): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Check if user is an admin
      const adminCheck = await isAdmin();
      if (adminCheck) {
        setIsLoading(false);
        return true;
      }

      // Use the RPC to check permission
      const { data, error } = await supabase.rpc('check_user_has_permission', {
        permission_name: `align_with_${visibility}_objectives`
      });

      if (error) {
        console.error(`Error checking align with ${visibility} permission:`, error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error(`Error in canAlignWithObjectiveVisibility for ${visibility}:`, error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check if user is an admin
  const isAdmin = useCallback(async (): Promise<boolean> => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return false;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }

      return data.role === 'admin';
    } catch (error) {
      console.error('Error in isAdmin check:', error);
      return false;
    }
  }, []);

  // Check if user is the owner of a specific objective
  const isObjectiveOwner = useCallback(async (objectiveId: string): Promise<boolean> => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return false;

      // First check if admin (admins always have owner rights)
      const adminCheck = await isAdmin();
      if (adminCheck) return true;

      // Check if user is the owner
      const { data, error } = await supabase.rpc('check_user_is_owner', {
        p_objective_id: objectiveId
      });

      if (error) {
        console.error('Error checking objective ownership:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in isObjectiveOwner:', error);
      return false;
    }
  }, []);

  return {
    isLoading,
    canCreateObjectives,
    canCreateObjectiveWithVisibility,
    canCreateKeyResults,
    canCreateAlignments,
    canAlignWithObjectiveVisibility,
    isAdmin,
    isObjectiveOwner,
  };
};
