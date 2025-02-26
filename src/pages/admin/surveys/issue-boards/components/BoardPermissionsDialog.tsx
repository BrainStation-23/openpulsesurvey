
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BoardPermissionsForm } from "./BoardPermissionsForm";
import type { IssueBoard, IssueBoardPermission } from "../types";

interface BoardPermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  board: IssueBoard | null;
  onSubmit: (permissions: Partial<IssueBoardPermission>[]) => void;
  permissions?: IssueBoardPermission[];
}

export function BoardPermissionsDialog({
  open,
  onOpenChange,
  board,
  onSubmit,
  permissions = []
}: BoardPermissionsDialogProps) {
  // Don't render the dialog if there's no board selected
  if (!board) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            Manage Permissions - {board.name}
          </DialogTitle>
        </DialogHeader>
        <BoardPermissionsForm
          board={board}
          onSubmit={onSubmit}
          initialPermissions={permissions}
        />
      </DialogContent>
    </Dialog>
  );
}
