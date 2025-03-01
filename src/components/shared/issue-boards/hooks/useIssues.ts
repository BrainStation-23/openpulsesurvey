
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Issue } from "../types";

export function useIssues(boardId: string) {
  const fetchIssues = async () => {
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
        downvote_count,
        board_id,
        has_voted:issue_votes(id),
        has_downvoted:issue_downvotes(id)
      `)
      .eq('board_id', boardId)
      .order('vote_count', { ascending: false });

    if (error) throw error;
    return data as Issue[];
  };

  return useQuery({
    queryKey: ['board-issues', boardId],
    queryFn: fetchIssues
  });
}
