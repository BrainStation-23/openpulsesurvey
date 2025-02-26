
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IssueBoardForm } from "./IssueBoardForm";
import type { IssueBoard } from "../types";

interface IssueBoardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: Partial<IssueBoard>) => void;
  initialValues?: Partial<IssueBoard>;
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
