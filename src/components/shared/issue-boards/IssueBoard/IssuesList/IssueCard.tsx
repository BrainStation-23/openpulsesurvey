
import React from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { VoteButton } from "./VoteButton";
import { IssueDetailsModal } from "./IssueDetailsModal";
import { Trash2, Edit2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import { EditIssueDialog } from "./EditIssueDialog";
import type { IssueCardProps } from "../../types";

export function IssueCard({ issue, canVote, hasVoted }: IssueCardProps) {
  const [showDetails, setShowDetails] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const queryClient = useQueryClient();
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

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

  const hasDownvoted = issue.has_downvoted?.length > 0;
  const canEdit = issue.can_edit || (currentUserId && issue.created_by === currentUserId);
  const authorName = issue.profiles?.first_name 
    ? `${issue.profiles.first_name} ${issue.profiles.last_name || ''}`.trim()
    : issue.profiles?.email || 'Unknown User';

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
              by {authorName}
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
            
            {canEdit && (
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
      <EditIssueDialog
        issue={issue}
        open={isEditing}
        onOpenChange={setIsEditing}
      />
    </>
  );
}
