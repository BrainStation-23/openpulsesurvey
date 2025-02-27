
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { UserIssueBoard } from "../types";

export function useIssueBoards() {
  return useQuery({
    queryKey: ['user-issue-boards'],
    queryFn: async () => {
      console.log('Fetching issue boards...');
      
      const { data: boardsData, error: boardsError } = await supabase
        .from('issue_boards')
        .select(`
          id,
          name,
          description,
          status,
          created_at,
          created_by,
          issue_board_permissions (
            can_view,
            can_create,
            can_vote,
            level_ids,
            location_ids,
            employment_type_ids,
            employee_type_ids,
            employee_role_ids,
            sbu_ids
          )
        `)
        .eq('status', 'active');

      if (boardsError) {
        console.error('Error fetching boards:', boardsError);
        throw boardsError;
      }

      console.log('Fetched boards:', boardsData);

      // Get current user's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          level_id,
          location_id,
          employment_type_id,
          employee_type_id,
          employee_role_id,
          user_sbus (
            sbu_id
          )
        `)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      console.log('Fetched user profile:', profile);

      // Filter boards based on user's attributes
      const filteredBoards = boardsData
        .filter(board => {
          const permissions = board.issue_board_permissions[0];
          console.log(`Checking permissions for board ${board.name}:`, permissions);
          
          if (!permissions) {
            console.log(`No permissions found for board ${board.name}`);
            return false;
          }

          // Check if arrays are null or empty (meaning everyone has access)
          const isEmptyOrNull = (arr?: any[]) => !arr || arr.length === 0;

          // Helper to check if user attribute matches or permission is open to all
          const checkAccess = (userValue: string | null | undefined, permissionArray?: string[], attributeName?: string) => {
            const hasAccess = isEmptyOrNull(permissionArray) || (userValue && permissionArray?.includes(userValue));
            console.log(`${attributeName} access check:`, { userValue, permissionArray, hasAccess });
            return hasAccess;
          };

          // Check access for each attribute
          const hasLevelAccess = checkAccess(profile.level_id, permissions.level_ids, 'Level');
          const hasLocationAccess = checkAccess(profile.location_id, permissions.location_ids, 'Location');
          const hasEmploymentTypeAccess = checkAccess(profile.employment_type_id, permissions.employment_type_ids, 'Employment Type');
          const hasEmployeeTypeAccess = checkAccess(profile.employee_type_id, permissions.employee_type_ids, 'Employee Type');
          const hasEmployeeRoleAccess = checkAccess(profile.employee_role_id, permissions.employee_role_ids, 'Employee Role');
          
          // Special check for SBU since it's an array of objects
          const hasSBUAccess = isEmptyOrNull(permissions.sbu_ids) || 
            profile.user_sbus?.some(us => permissions.sbu_ids?.includes(us.sbu_id));
          
          console.log('SBU access check:', {
            userSBUs: profile.user_sbus,
            permissionSBUs: permissions.sbu_ids,
            hasSBUAccess
          });

          // User needs to match at least one criteria
          const hasAccess = hasLevelAccess || hasLocationAccess || hasEmploymentTypeAccess || 
                         hasEmployeeTypeAccess || hasEmployeeRoleAccess || hasSBUAccess;
          
          console.log(`Final access decision for board ${board.name}:`, hasAccess);
          return hasAccess;
        })
        .map(board => ({
          id: board.id,
          name: board.name,
          description: board.description,
          status: board.status,
          created_at: board.created_at,
          created_by: board.created_by,
          permissions: {
            can_view: board.issue_board_permissions[0]?.can_view ?? false,
            can_create: board.issue_board_permissions[0]?.can_create ?? false,
            can_vote: board.issue_board_permissions[0]?.can_vote ?? false
          }
        })) as UserIssueBoard[];

      console.log('Final filtered and mapped boards:', filteredBoards);
      return filteredBoards;
    }
  });
}
