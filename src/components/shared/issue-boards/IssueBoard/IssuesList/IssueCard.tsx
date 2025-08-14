import React from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { VoteButton } from "./VoteButton";
import { IssueDetailsModal } from "./IssueDetailsModal";
import { IssueForm } from "./IssueForm";
import { Trash2, Edit2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { IssueCardProps } from "../../types";

export function IssueCard({ issue, canVote, hasVoted }: IssueCardProps) {
  const [showDetails, setShowDetails] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(issue.title);
  const [editDescription, setEditDescription] = React.useState(issue.description || "");
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (isEditing) {
      setEditTitle(issue.title);
      setEditDescription(issue.description || "");
    }
  }, [issue, isEditing]);

  const handleVote = async (issueId: string) => {
    await queryClient.invalidateQueries({ queryKey: ['board-issues', issue.board_id] });
  };

  const handleDownvote = async (issueId: string) => {
    await queryClient.invalidateQueries({ queryKey: ['board-issues', issue.board_id] });
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
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete issue: " + error.message,
        variant: "destructive",
      });
    },
  });

  const editIssueMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('issues')
        .update({
          title: editTitle.trim(),
          description: editDescription.trim() || null,
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
    if (!editTitle.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }
    editIssueMutation.mutate();
  };

  const hasDownvoted = issue.has_downvoted?.length > 0;

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex-1">
            <h3 className="font-semibold leading-none tracking-tight text-lg">
              {issue.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Created {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })} 
              by {issue.profiles?.first_name} {issue.profiles?.last_name || issue.profiles?.email}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(true)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            {issue.can_edit && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteIssueMutation.mutate()}
                  disabled={deleteIssueMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </CardHeader>

        {issue.description && (
          <CardContent className="pt-0">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{issue.description}</ReactMarkdown>
            </div>
          </CardContent>
        )}

        <CardFooter className="flex justify-between items-center pt-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>#{issue.id.slice(0, 8)}</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              issue.status === 'open' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              issue.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
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

      {/* Edit Issue Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="w-[80vw] max-w-none max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Issue</DialogTitle>
          </DialogHeader>
          
          <IssueForm
            title={editTitle}
            description={editDescription}
            onTitleChange={setEditTitle}
            onDescriptionChange={setEditDescription}
            onSubmit={handleEditSubmit}
            onCancel={() => setIsEditing(false)}
            isSubmitting={editIssueMutation.isPending}
            submitButtonText="Update Issue"
            submitButtonLoadingText="Updating..."
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
