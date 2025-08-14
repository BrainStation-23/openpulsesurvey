
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { IssueForm } from "./IssueForm";
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
            title: title.trim(),
            description: description.trim() || null,
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
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }
    createIssueMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Issue
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[80vw] max-w-none max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Issue</DialogTitle>
        </DialogHeader>
        
        <IssueForm
          title={title}
          description={description}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          isSubmitting={createIssueMutation.isPending}
          submitButtonText="Create Issue"
          submitButtonLoadingText="Creating..."
        />
      </DialogContent>
    </Dialog>
  );
}
