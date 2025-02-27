
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useVoting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (issueId: string) => {
      const { data: existingVote, error: checkError } = await supabase
        .from('issue_votes')
        .select('id')
        .eq('issue_id', issueId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingVote) {
        const { error } = await supabase
          .from('issue_votes')
          .delete()
          .eq('id', existingVote.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('issue_votes')
          .insert({ issue_id: issueId });
        if (error) throw error;
      }
    },
    onSuccess: (_, issueId) => {
      queryClient.invalidateQueries({ queryKey: ['board-issues'] });
    }
  });
}
