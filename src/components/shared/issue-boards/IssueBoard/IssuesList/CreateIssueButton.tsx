
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Save, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { TiptapEditor } from "./TiptapEditor";
import type { CreateIssueButtonProps } from "../../types";

export function CreateIssueButton({ boardId, onIssueCreated }: CreateIssueButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const queryClient = useQueryClient();

  const createIssueMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('issues')
        .insert([
          {
            title,
            description: description || null,
            board_id: boardId,
            created_by: user.id,
          }
        ]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board-issues', boardId] });
      toast({
        title: "Success",
        description: "Issue created successfully",
      });
      setTitle("");
      setDescription("");
      setOpen(false);
      onIssueCreated?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create issue: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createIssueMutation.mutate();
  };

  const handleCancel = () => {
    setTitle("");
    setDescription("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Issue
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-none">
          <DialogTitle className="text-lg font-semibold">Create New Issue</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 gap-6 overflow-hidden">
          {/* Title Section */}
          <div className="flex-none space-y-2">
            <Label htmlFor="new-issue-title" className="text-sm font-medium">
              Title *
            </Label>
            <Input
              id="new-issue-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a clear, descriptive title"
              className="text-base"
              required
              disabled={createIssueMutation.isPending}
            />
          </div>

          {/* Description Section */}
          <div className="flex-1 flex flex-col space-y-2 overflow-hidden">
            <Label className="text-sm font-medium">
              Description
            </Label>
            <div className="flex-1 overflow-hidden">
              <TiptapEditor
                content={description}
                onChange={setDescription}
                placeholder="Describe the issue in detail. You can use markdown formatting..."
                className="h-full flex flex-col"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Use the toolbar above to format your text with headings, lists, links, and more.
            </p>
          </div>

          {/* Actions */}
          <div className="flex-none flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={createIssueMutation.isPending}
              className="min-w-[80px]"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createIssueMutation.isPending || !title.trim()}
              className="min-w-[80px]"
            >
              <Save className="h-4 w-4 mr-2" />
              {createIssueMutation.isPending ? "Creating..." : "Create Issue"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
