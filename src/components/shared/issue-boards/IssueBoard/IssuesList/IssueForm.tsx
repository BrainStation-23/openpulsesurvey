
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichMarkdownEditor } from "./RichMarkdownEditor";

interface IssueFormProps {
  title: string;
  description: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  submitButtonText: string;
  submitButtonLoadingText: string;
}

export function IssueForm({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onSubmit,
  onCancel,
  isSubmitting,
  submitButtonText,
  submitButtonLoadingText,
}: IssueFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6 flex-1 min-h-0">
      <div className="space-y-2">
        <Label htmlFor="issue-title">Title</Label>
        <Input
          id="issue-title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter issue title"
          required
        />
      </div>
      
      <div className="space-y-2 flex-1 min-h-0">
        <Label htmlFor="issue-description">Description</Label>
        <RichMarkdownEditor
          value={description}
          onChange={onDescriptionChange}
          placeholder="Describe the issue in detail using markdown..."
          className="flex-1"
        />
      </div>
      
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? submitButtonLoadingText : submitButtonText}
        </Button>
      </div>
    </form>
  );
}
