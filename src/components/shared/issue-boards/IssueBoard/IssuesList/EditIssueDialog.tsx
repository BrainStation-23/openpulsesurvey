
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";
import { TiptapEditor } from "./TiptapEditor";

interface EditIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EditIssueDialog({
  open,
  onOpenChange,
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onSave,
  onCancel,
  isLoading = false
}: EditIssueDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-none">
          <DialogTitle className="text-lg font-semibold">Edit Issue</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 gap-6 overflow-hidden">
          {/* Title Section */}
          <div className="flex-none space-y-2">
            <Label htmlFor="issue-title" className="text-sm font-medium">
              Title *
            </Label>
            <Input
              id="issue-title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Enter a clear, descriptive title"
              className="text-base"
              required
              disabled={isLoading}
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
                onChange={onDescriptionChange}
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
              onClick={onCancel}
              disabled={isLoading}
              className="min-w-[80px]"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="min-w-[80px]"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
