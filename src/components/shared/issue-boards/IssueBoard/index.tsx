
import React from "react";
import { useBoardData } from "../hooks/useBoardData";
import { BoardHeader } from "./BoardHeader";
import { IssuesList } from "./IssuesList";
import { CreateIssueButton } from "./CreateIssueButton";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { BoardViewProps } from "../types";

export function IssueBoard({ boardId }: BoardViewProps) {
  const { data: board, isLoading, error } = useBoardData(boardId);

  const handleBack = () => {
    window.history.back();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="text-center p-8 text-destructive">
        Error loading board. Please try again.
      </div>
    );
  }

  const permissions = board.permissions[0] || {};
  const { can_create = false, can_vote = false } = permissions;

  return (
    <div className="space-y-6">
      <BoardHeader board={board} onBack={handleBack} />
      
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Issues</h2>
        {can_create && (
          <CreateIssueButton boardId={boardId} />
        )}
      </div>

      <IssuesList 
        boardId={boardId} 
        canVote={can_vote} 
      />
    </div>
  );
}
