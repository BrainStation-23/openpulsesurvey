
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Issue } from "@/pages/user/issue-boards/types";

export function useIssues(boardId: string) {
  return useQuery({
    queryKey: ['board-issues', boardId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issues')
        .select(`
          id,
          title,
          description,
          created_at,
          created_by,
          status,
          vote_count,
          board_id,
          has_voted:issue_votes(id)
        `)
        .eq('board_id', boardId)
        .order('vote_count', { ascending: false });

      if (error) throw error;
      return data as Issue[];
    }
  });
}
