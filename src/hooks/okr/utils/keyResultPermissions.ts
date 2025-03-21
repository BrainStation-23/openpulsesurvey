
import { supabase } from '@/integrations/supabase/client';

/**
 * Checks if the current user has permission to modify key results for the given objective
 * 
 * @param objectiveId - The ID of the objective to check permissions for
 * @returns A promise that resolves to true if the user has permission
 * @throws Error if the user doesn't have permission or if there was an error checking permissions
 */
export const checkObjectivePermission = async (objectiveId: string): Promise<boolean> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const currentUserId = sessionData.session?.user?.id;
  
  if (!currentUserId) {
    throw new Error('You must be logged in to perform this action.');
  }
  
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', currentUserId)
    .eq('role', 'admin')
    .single();
    
  if (roleData) {
    return true;
  }
  
  const { data: objectiveData, error: objectiveError } = await supabase
    .from('objectives')
    .select('owner_id')
    .eq('id', objectiveId)
    .single();
    
  if (objectiveError) {
    console.error('Error checking objective ownership:', objectiveError);
    throw new Error('Could not verify permissions for this objective');
  }
  
  if (objectiveData.owner_id !== currentUserId) {
    throw new Error('You do not have permission to modify key results for this objective');
  }
  
  return true;
};
