
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export function useVoting() {
  const queryClient = useQueryClient();

  const handleVote = async ({ issueId, isDownvote }: { issueId: string; isDownvote: boolean }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const oppositeTable = isDownvote ? 'issue_votes' : 'issue_downvotes';
    const currentTable = isDownvote ? 'issue_downvotes' : 'issue_votes';
    
    // First check if the user has already voted in either table
    const { data: oppositeVotes } = await supabase
      .from(oppositeTable)
      .select('id')
      .eq('issue_id', issueId)
      .eq('user_id', user.id)
      .single();

    const { data: currentVotes } = await supabase
      .from(currentTable)
      .select('id')
      .eq('issue_id', issueId)
      .eq('user_id', user.id)
      .single();

    // If there's an opposite vote, remove it first
    if (oppositeVotes) {
      const { error: deleteOppositeError } = await supabase
        .from(oppositeTable)
        .delete()
        .eq('id', oppositeVotes.id);
        
      if (deleteOppositeError) throw deleteOppositeError;
    }

    if (currentVotes) {
      // If vote exists in current table, remove it (unvote)
      const { error: deleteError } = await supabase
        .from(currentTable)
        .delete()
        .eq('id', currentVotes.id);
        
      if (deleteError) throw deleteError;
    } else {
      // If no vote exists in current table, add one
      const { error: insertError } = await supabase
        .from(currentTable)
        .insert({ 
          issue_id: issueId,
          user_id: user.id
        });
        
      if (insertError) throw insertError;
    }
  };

  return useMutation({
    mutationFn: handleVote,
    onSuccess: () => {
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
