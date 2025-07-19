
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { UserIssueBoard } from "../types";

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
          created_by
        `)
        .eq('id', boardId)
        .single();

      if (error) throw error;
      
      // Return simplified board data - permissions will be handled separately
      return {
        ...data,
        permissions: [] // Empty array to maintain compatibility
      } as UserIssueBoard;
    }
  });
}
