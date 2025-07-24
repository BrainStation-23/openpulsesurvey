
import React from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { VoteButton } from "./VoteButton";
import { Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useVoting } from "../../hooks/useVoting";
import type { IssueCardProps } from "../../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function IssueCard({ 
  issue, 
  canVote,
  hasVoted,
}: IssueCardProps) {
  const queryClient = useQueryClient();
  const { mutate: vote } = useVoting();
  const [canEdit, setCanEdit] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(issue.title);
  const [editDescription, setEditDescription] = React.useState(issue.description || "");
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
          title: editTitle,
          description: editDescription
        })
        .eq('id', issue.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board-issues', issue.board_id] });
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Issue updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update issue: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    editIssueMutation.mutate();
  };

  return (
    <Card className={cn(
      "flex flex-col h-[200px] transition-all duration-200 hover:shadow-md",
      getCardColorClass()
    )}>
      <CardHeader className="flex-none py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-medium text-sm line-clamp-2">{issue.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {getScoreIndicator()}
            {canEdit && (
              <div className="flex gap-1 flex-shrink-0">
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Issue</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Enter issue title"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Enter issue description"
                          rows={4}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={editIssueMutation.isPending}
                        >
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => deleteIssueMutation.mutate()}
                  disabled={deleteIssueMutation.isPending}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            )}
          </div>
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
          hasVoted={Boolean(issue.has_voted?.length)}
          hasDownvoted={hasDownvoted}
          onVote={() => vote({ issueId: issue.id, isDownvote: false })}
          onDownvote={() => vote({ issueId: issue.id, isDownvote: true })}
          disabled={!canVote}
        />
      </CardFooter>
    </Card>
  );
}
