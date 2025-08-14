import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IssueForm } from "./IssueForm";

interface IssueEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onTitleChange: (s: string) => void;
  onDescriptionChange: (s: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export function IssueEditDialog({
  open,
  onOpenChange,
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onSubmit,
  isSubmitting,
}: IssueEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[80vw] max-w-none max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Issue</DialogTitle>
        </DialogHeader>
        <IssueForm
          title={title}
          description={description}
          onTitleChange={onTitleChange}
          onDescriptionChange={onDescriptionChange}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
          submitButtonText="Update Issue"
          submitButtonLoadingText="Updating..."
        />
      </DialogContent>
    </Dialog>
  );
}
