
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { UserIssueBoard } from "@/pages/user/issue-boards/types";

export function useBoardData(boardId: string) {
  return useQuery({
    queryKey: ['board', boardId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issue_boards')
        .select(`
          id,
          name,
          description,
          status,
          created_at,
          created_by,
          permissions:issue_board_permissions(
            can_view,
            can_create,
            can_vote
          )
        `)
        .eq('id', boardId)
        .single();

      if (error) throw error;
      return data as UserIssueBoard;
    }
  });
}
