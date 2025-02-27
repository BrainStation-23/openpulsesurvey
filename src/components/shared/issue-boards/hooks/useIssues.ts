
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Issue } from "../types";
import { useEffect } from "react";

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
        board_id,
        has_voted:issue_votes(id)
      `)
      .eq('board_id', boardId)
      .order('vote_count', { ascending: false });

    if (error) throw error;
    return data as Issue[];
  };

  const query = useQuery({
    queryKey: ['board-issues', boardId],
    queryFn: fetchIssues
  });

  useEffect(() => {
    // Subscribe to both issues and issue_votes changes
    const channel = supabase
      .channel('issue-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'issues',
          filter: `board_id=eq.${boardId}`
        },
        () => {
          query.refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'issue_votes'
        },
        () => {
          query.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [boardId, query]);

  return query;
}
