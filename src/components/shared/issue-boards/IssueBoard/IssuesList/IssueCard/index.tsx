
import React from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { VoteButton } from "../VoteButton";
import { supabase } from "@/integrations/supabase/client";
import { useVoting } from "../../../hooks/useVoting";
import type { IssueCardProps } from "../../../types";
import { CardHeader as IssueCardHeader } from "./CardHeader";
import { EditDialog } from "./EditDialog";

export function IssueCard({ 
  issue, 
  canVote,
  hasVoted,
}: IssueCardProps) {
  const { mutate: vote } = useVoting();
  const [canEdit, setCanEdit] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [hasDownvoted, setHasDownvoted] = React.useState(false);

  React.useEffect(() => {
    const checkEditPermission = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      setCanEdit(userRole?.role === 'admin' || issue.created_by === user.id);
    };

    checkEditPermission();
  }, [issue.created_by]);

  React.useEffect(() => {
    const checkDownvote = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: downvotes } = await supabase
        .from('issue_downvotes')
        .select()
        .eq('issue_id', issue.id)
        .eq('user_id', user.id);

      setHasDownvoted(Boolean(downvotes?.length));
    };

    checkDownvote();
  }, [issue.id]);

  return (
    <Card className="flex flex-col h-[200px]">
      <CardHeader className="flex-none py-3">
        <IssueCardHeader
          issue={issue}
          canEdit={canEdit}
          onEdit={() => setIsEditDialogOpen(true)}
        />
      </CardHeader>
      <CardContent className="flex-1 overflow-auto py-2">
        {issue.description && (
          <p className="text-xs text-muted-foreground">{issue.description}</p>
        )}
      </CardContent>
      <CardFooter className="flex-none pt-3 border-t">
        <VoteButton
          issueId={issue.id}
          voteCount={issue.vote_count}
          downvoteCount={issue.downvote_count || 0}
          hasVoted={hasVoted}
          hasDownvoted={hasDownvoted}
          onVote={() => vote({ issueId: issue.id, isDownvote: false })}
          onDownvote={() => vote({ issueId: issue.id, isDownvote: true })}
          disabled={!canVote}
        />
      </CardFooter>

      <EditDialog
        issue={issue}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </Card>
  );
}
