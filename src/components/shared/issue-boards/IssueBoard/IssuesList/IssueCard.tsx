
import React from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { VoteButton } from "./VoteButton";
import { Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
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
import type { IssueCardProps } from "../../types";

export function IssueCard({ 
  issue, 
  canVote,
  hasVoted,
  onVote 
}: IssueCardProps) {
  const queryClient = useQueryClient();
  const [canEdit, setCanEdit] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(issue.title);
  const [editDescription, setEditDescription] = React.useState(issue.description || "");

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
    <>
      <Card className="flex flex-col h-[250px]">
        <CardHeader className="flex-none">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-semibold line-clamp-2">{issue.title}</h3>
            {canEdit && (
              <div className="flex gap-2 flex-shrink-0">
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Edit2 className="h-4 w-4" />
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
                  onClick={() => deleteIssueMutation.mutate()}
                  disabled={deleteIssueMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            )}
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
    </>
  );
}
