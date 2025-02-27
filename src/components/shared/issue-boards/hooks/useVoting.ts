
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export function useVoting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (issueId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First check if the user has already voted
      const { data: existingVote, error: checkError } = await supabase
        .from('issue_votes')
        .select('id')
        .eq('issue_id', issueId)
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingVote) {
        // If vote exists, remove it (unvote)
        const { error: deleteError } = await supabase
          .from('issue_votes')
          .delete()
          .eq('id', existingVote.id);
          
        if (deleteError) throw deleteError;
      } else {
        // If no vote exists, add one
        const { error: insertError } = await supabase
          .from('issue_votes')
          .insert({ 
            issue_id: issueId,
            user_id: user.id
          });
          
        if (insertError) throw insertError;
      }
    },
    onSuccess: (_, issueId) => {
      queryClient.invalidateQueries({ queryKey: ['board-issues'] });
      toast({
        title: "Success",
        description: "Vote updated successfully",
      });
    },
    onError: (error) => {
      console.error('Voting error:', error);
      toast({
        title: "Error",
        description: "Failed to update vote. Please try again.",
        variant: "destructive"
      });
    }
  });
}
