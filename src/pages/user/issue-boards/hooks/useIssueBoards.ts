
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { UserIssueBoard } from "../types";
import type { BoardPermissionResult } from "@/components/shared/issue-boards/hooks/useBoardPermissions";

export function useIssueBoards() {
  return useQuery({
    queryKey: ['user-issue-boards'],
    queryFn: async () => {
      console.log('Fetching issue boards with new permission system...');
      
      // First, get all active boards
      const { data: boardsData, error: boardsError } = await supabase
        .from('issue_boards')
        .select('*')
        .eq('status', 'active');

      if (boardsError) {
        console.error('Error fetching boards:', boardsError);
        throw boardsError;
      }

      console.log('Fetched boards:', boardsData);

      if (!boardsData || boardsData.length === 0) {
        console.log('No boards found');
        return [];
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user');
        return [];
      }

      // Check permissions for each board using the new RPC function
      const boardsWithPermissions = await Promise.all(
        boardsData.map(async (board) => {
          try {
            const { data: permissionData, error: permissionError } = await supabase.rpc(
              'get_user_board_permissions',
              {
                p_user_id: user.id,
                p_board_id: board.id
              }
            );

            if (permissionError) {
              console.error(`Error checking permissions for board ${board.id}:`, permissionError);
              return null;
            }

            console.log(`Permissions for board ${board.name}:`, permissionData);

            // Cast to the correct type and check permissions
            const permissions = permissionData as unknown as BoardPermissionResult;

            // Only include boards where user has view permission
            if (permissions?.can_view) {
              return {
                id: board.id,
                name: board.name,
                description: board.description,
                status: board.status,
                created_at: board.created_at,
                created_by: board.created_by,
                permissions: {
                  can_view: permissions.can_view,
                  can_create: permissions.can_create,
                  can_vote: permissions.can_vote
                }
              } as UserIssueBoard;
            }

            return null;
          } catch (error) {
            console.error(`Error processing board ${board.id}:`, error);
            return null;
          }
        })
      );

      // Filter out null results (boards without view permission)
      const accessibleBoards = boardsWithPermissions.filter(
        (board): board is UserIssueBoard => board !== null
      );

      console.log('Accessible boards:', accessibleBoards);
      return accessibleBoards;
    }
  });
}
