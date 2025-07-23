
import React from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { VoteButton } from "../VoteButton";
import { supabase } from "@/integrations/supabase/client";
import { useVoting } from "../../../hooks/useVoting";
import type { IssueCardProps } from "../../../types";
import { CardHeader as IssueCardHeader } from "./CardHeader";
import { EditDialog } from "./EditDialog";
import { cn } from "@/lib/utils";

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

  // Calculate vote ratio and determine color
  const totalVotes = issue.vote_count + (issue.downvote_count || 0);
  const getCardColorClass = () => {
    if (totalVotes === 0) return "border-muted bg-card";
    
    const upvoteRatio = issue.vote_count / totalVotes;
    
    if (upvoteRatio >= 0.8) {
      return "border-green-200 bg-green-50/50 shadow-green-100";
    } else if (upvoteRatio >= 0.6) {
      return "border-emerald-200 bg-emerald-50/50 shadow-emerald-100";
    } else if (upvoteRatio >= 0.4) {
      return "border-yellow-200 bg-yellow-50/50 shadow-yellow-100";
    } else if (upvoteRatio >= 0.2) {
      return "border-orange-200 bg-orange-50/50 shadow-orange-100";
    } else {
      return "border-red-200 bg-red-50/50 shadow-red-100";
    }
  };

  const getScoreIndicator = () => {
    if (totalVotes === 0) return null;
    
    const upvoteRatio = issue.vote_count / totalVotes;
    const score = Math.round(upvoteRatio * 100);
    
    let indicatorColor = "bg-gray-500";
    if (upvoteRatio >= 0.8) indicatorColor = "bg-green-500";
    else if (upvoteRatio >= 0.6) indicatorColor = "bg-emerald-500";
    else if (upvoteRatio >= 0.4) indicatorColor = "bg-yellow-500";
    else if (upvoteRatio >= 0.2) indicatorColor = "bg-orange-500";
    else indicatorColor = "bg-red-500";
    
    return (
      <div className="flex items-center gap-1">
        <div className={cn("w-2 h-2 rounded-full", indicatorColor)} />
        <span className="text-xs font-medium text-muted-foreground">
          {score}%
        </span>
      </div>
    );
  };

  return (
    <Card className={cn(
      "flex flex-col h-[200px] transition-all duration-200 hover:shadow-md",
      getCardColorClass()
    )}>
      <CardHeader className="flex-none py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <IssueCardHeader
              issue={issue}
              canEdit={canEdit}
              onEdit={() => setIsEditDialogOpen(true)}
            />
          </div>
          {getScoreIndicator()}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto py-2">
        {issue.description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {issue.description}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex-none pt-3 border-t bg-background/50">
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
