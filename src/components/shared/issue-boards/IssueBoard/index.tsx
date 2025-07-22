
import React from "react";
import { useBoardData } from "../hooks/useBoardData";
import { BoardHeader } from "./BoardHeader";
import { IssuesList } from "./IssuesList";
import { CreateIssueButton } from "./CreateIssueButton";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PermissionProvider, usePermissionContext } from "../contexts/PermissionContext";
import { PermissionDebugger } from "../components/PermissionDebugger";
import type { BoardViewProps } from "../types";

function IssueBoardContent({ boardId }: BoardViewProps) {
  const { data: board, isLoading: boardLoading, error: boardError } = useBoardData(boardId);
  const { permissions, isLoading: permissionsLoading } = usePermissionContext();

  const handleBack = () => {
    window.history.back();
  };

  if (boardLoading || permissionsLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (boardError || !board) {
    return (
      <div className="text-center p-8 text-destructive">
        Error loading board. Please try again.
      </div>
    );
  }

  if (!permissions?.can_view) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        You don't have permission to view this board.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <BoardHeader board={board} onBack={handleBack} />
      
      <div className="flex justify-end">
        {permissions.can_create && (
          <CreateIssueButton boardId={boardId} />
        )}
      </div>

      <IssuesList 
        boardId={boardId} 
        canVote={permissions.can_vote} 
      />
      
      <PermissionDebugger />
    </div>
  );
}

export function IssueBoard({ boardId }: BoardViewProps) {
  return (
    <PermissionProvider boardId={boardId}>
      <IssueBoardContent boardId={boardId} />
    </PermissionProvider>
  );
}
