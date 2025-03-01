
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export function useVoting() {
  const queryClient = useQueryClient();

  const handleVote = async ({ issueId, isDownvote }: { issueId: string; isDownvote: boolean }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const table = isDownvote ? 'issue_downvotes' : 'issue_votes';
    
    // First check if the user has already voted
    const { data: votes } = await supabase
      .from(table)
      .select('id')
      .eq('issue_id', issueId)
      .eq('user_id', user.id)
      .single();

    if (votes) {
      // If vote exists, remove it (unvote)
      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq('id', votes.id);
        
      if (deleteError) throw deleteError;
    } else {
      // If no vote exists, add one
      const { error: insertError } = await supabase
        .from(table)
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
