
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { RichMarkdownEditor } from "./RichMarkdownEditor";
import type { Issue } from "../../types";

interface EditIssueDialogProps {
  issue: Issue;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditIssueDialog({ issue, open, onOpenChange }: EditIssueDialogProps) {
  const [title, setTitle] = React.useState(issue.title);
  const [description, setDescription] = React.useState(issue.description || "");
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (open) {
      setTitle(issue.title);
      setDescription(issue.description || "");
    }
  }, [issue, open]);

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
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update issue: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Issue</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-1 min-h-0">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter issue title"
              required
            />
          </div>
          
          <div className="space-y-2 flex-1 min-h-0">
            <Label htmlFor="edit-description">Description</Label>
            <RichMarkdownEditor
              value={description}
              onChange={setDescription}
              placeholder="Describe the issue in detail using markdown..."
              className="flex-1"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateIssueMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateIssueMutation.isPending}
            >
              {updateIssueMutation.isPending ? "Updating..." : "Update Issue"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
