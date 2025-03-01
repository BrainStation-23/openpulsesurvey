
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import type { Issue } from "../../../types";

interface EditDialogProps {
  issue: Issue;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditDialog({ issue, isOpen, onOpenChange }: EditDialogProps) {
  const queryClient = useQueryClient();
  const [editTitle, setEditTitle] = React.useState(issue.title);
  const [editDescription, setEditDescription] = React.useState(issue.description || "");

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
      onOpenChange(false);
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              onClick={() => onOpenChange(false)}
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
  );
}
