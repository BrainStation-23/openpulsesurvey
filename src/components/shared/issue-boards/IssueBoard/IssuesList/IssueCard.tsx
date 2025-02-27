
import React from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VoteButton } from "./VoteButton";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import type { IssueCardProps } from "../../types";

export function IssueCard({ 
  issue, 
  canVote,
  hasVoted,
  onVote 
}: IssueCardProps) {
  const queryClient = useQueryClient();
  const [canDelete, setCanDelete] = React.useState(false);

  React.useEffect(() => {
    const checkDeletePermission = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      setCanDelete(userRole?.role === 'admin' || issue.created_by === user.id);
    };

    checkDeletePermission();
  }, [issue.created_by]);

  const deleteIssueMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('issues')
        .delete()
        .eq('id', issue.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board-issues', issue.board_id] });
      toast({
        title: "Success",
        description: "Issue deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete issue: " + error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Card className="flex flex-col h-[250px]">
      <CardHeader className="flex-none">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-semibold line-clamp-2">{issue.title}</h3>
          <div className="flex gap-2 flex-shrink-0">
            <Badge variant={issue.status === 'open' ? 'default' : 'secondary'}>
              {issue.status}
            </Badge>
            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteIssueMutation.mutate()}
                disabled={deleteIssueMutation.isPending}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {issue.description && (
          <p className="text-sm text-muted-foreground">{issue.description}</p>
        )}
      </CardContent>
      <CardFooter className="flex-none pt-4 border-t">
        <VoteButton
          issueId={issue.id}
          voteCount={issue.vote_count}
          hasVoted={hasVoted}
          onVote={onVote}
          disabled={!canVote}
        />
      </CardFooter>
    </Card>
  );
}
