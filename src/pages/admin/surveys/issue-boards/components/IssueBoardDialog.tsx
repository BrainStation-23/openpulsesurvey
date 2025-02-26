
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IssueBoardForm } from "./IssueBoardForm";
import type { IssueBoard } from "../types";

type IssueBoardFormValues = {
  name: string;
  description?: string;
  status: 'active' | 'disabled';  // Changed from 'archived' to 'disabled'
};

interface IssueBoardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: IssueBoardFormValues) => void;
  initialValues?: Partial<IssueBoardFormValues>;
  mode: "create" | "edit";
}

export function IssueBoardDialog({
  open,
  onOpenChange,
  onSubmit,
  initialValues,
  mode
}: IssueBoardDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Issue Board" : "Edit Issue Board"}
          </DialogTitle>
        </DialogHeader>
        <IssueBoardForm
          onSubmit={onSubmit}
          initialValues={initialValues}
          submitLabel={mode === "create" ? "Create Board" : "Save Changes"}
        />
      </DialogContent>
    </Dialog>
  );
}
