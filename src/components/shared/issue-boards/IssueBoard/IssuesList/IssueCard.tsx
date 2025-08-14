
import React from "react";
import { Card, CardHeader, CardFooter } from "@/components/ui/card";
import { VoteButton } from "./VoteButton";
import { IssueDetailsModal } from "./IssueDetailsModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { DeleteConfirmationDialog } from "@/pages/admin/config/shared/components/DeleteConfirmationDialog";
import { useVoting } from "../../hooks/useVoting";
import { cn } from "@/lib/utils";
import type { IssueCardProps } from "../../types";
import { IssueCardHeader } from "./IssueCardHeader";
import { IssueEditDialog } from "./IssueEditDialog";

export function IssueCard({ issue, canVote, hasVoted }: IssueCardProps) {
  const [showDetails, setShowDetails] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const queryClient = useQueryClient();
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState(issue.title);
  const [description, setDescription] = React.useState(issue.description || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const { mutate: vote, isPending: isVoting } = useVoting();
  const [canEdit, setCanEdit] = React.useState<boolean>(false);
  const [hasDownvoted, setHasDownvoted] = React.useState<boolean>(Boolean(issue.has_downvoted?.length));

  React.useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  React.useEffect(() => {
    if (isEditing) {
      setTitle(issue.title);
      setDescription(issue.description || "");
    }
  }, [issue, isEditing]);

  // Compute edit permissions (admin or creator) similar to old behavior
  React.useEffect(() => {
    const computeCanEdit = async () => {
      const base = Boolean(issue.can_edit) || (currentUserId !== null && issue.created_by === currentUserId);
      if (!currentUserId) {
        setCanEdit(base);
        return;
      }
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUserId)
        .single();
      setCanEdit(base || userRole?.role === 'admin');
    };
    computeCanEdit();
  }, [currentUserId, issue]);

  // Determine if current user has downvoted (fallback when not provided on issue)
  React.useEffect(() => {
    const checkDownvote = async () => {
      if (!currentUserId) return;
      const { data: downvotes } = await supabase
        .from('issue_downvotes')
        .select('id')
        .eq('issue_id', issue.id)
        .eq('user_id', currentUserId);
      setHasDownvoted(Boolean(downvotes && downvotes.length));
    };
    checkDownvote();
  }, [currentUserId, issue.id]);

  // Visual design rules based on vote ratio
  const totalVotes = (issue.vote_count || 0) + (issue.downvote_count || 0);
  const getCardColorClass = () => {
    if (totalVotes === 0) return "border-muted bg-card";
    const upvoteRatio = (issue.vote_count || 0) / totalVotes;
    if (upvoteRatio >= 0.8) return "border-green-200 bg-green-50/50 shadow-green-100";
    if (upvoteRatio >= 0.6) return "border-emerald-200 bg-emerald-50/50 shadow-emerald-100";
    if (upvoteRatio >= 0.4) return "border-yellow-200 bg-yellow-50/50 shadow-yellow-100";
    if (upvoteRatio >= 0.2) return "border-orange-200 bg-orange-50/50 shadow-orange-100";
    return "border-red-200 bg-red-50/50 shadow-red-100";
  };

  // score indicator is handled inside IssueCardHeader

  const handleVote = (issueId: string) => {
    vote(
      { issueId, isDownvote: false },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board-issues', issue.board_id] }) }
    );
  };

  const handleDownvote = (issueId: string) => {
    vote(
      { issueId, isDownvote: true },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board-issues', issue.board_id] }) }
    );
  };

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
      setShowDeleteConfirm(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete issue: " + error.message,
        variant: "destructive",
      });
    },
  });

  const updateIssueMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('issues')
        .update({
          title: title.trim(),
          description: description.trim() || null,
        })
        .eq('id', issue.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board-issues', issue.board_id] });
      toast({
        title: "Success",
        description: "Issue updated successfully",
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update issue: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }
    updateIssueMutation.mutate();
  };

  // author info is rendered inside IssueCardHeader

  return (
    <>
      <Card className={cn("w-full transition-all duration-200 hover:shadow-md", getCardColorClass())}>
        <CardHeader className="pb-2">
          <IssueCardHeader
            issue={issue}
            onViewDetails={() => setShowDetails(true)}
            canEdit={canEdit}
            onStartEdit={() => setIsEditing(true)}
            onRequestDelete={() => setShowDeleteConfirm(true)}
            isDeletePending={deleteIssueMutation.isPending}
          />
        </CardHeader>


        <CardFooter className="flex justify-between items-center pt-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className={`px-2 py-1 rounded-full text-xs ${
              issue.status === 'open' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}>
              {issue.status.replace('_', ' ')}
            </span>
          </div>
          
          {canVote && (
            <VoteButton
              issueId={issue.id}
              voteCount={issue.vote_count || 0}
              downvoteCount={issue.downvote_count || 0}
              hasVoted={hasVoted}
              hasDownvoted={hasDownvoted}
              onVote={handleVote}
              onDownvote={handleDownvote}
              disabled={!canVote || isVoting}
            />
          )}
        </CardFooter>
      </Card>

      {/* Issue Details Modal */}
      <IssueDetailsModal
        issue={issue}
        open={showDetails}
        onOpenChange={setShowDetails}
      />

      <IssueEditDialog
        open={isEditing}
        onOpenChange={setIsEditing}
        title={title}
        description={description}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onSubmit={handleEditSubmit}
        isSubmitting={updateIssueMutation.isPending}
      />

      {/* Delete confirmation dialog */}
      <DeleteConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={() => deleteIssueMutation.mutate()}
      />
    </>
  );
}
