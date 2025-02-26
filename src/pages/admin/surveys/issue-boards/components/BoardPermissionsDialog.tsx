
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
  board: IssueBoard;
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
