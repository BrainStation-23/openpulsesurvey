
import React from "react";
import { BoardsGrid } from "./components/BoardsGrid";
import { useIssueBoards } from "./hooks/useIssueBoards";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function UserIssueBoards() {
  const { data: boards, isLoading, error } = useIssueBoards();

  if (isLoading) {
    return (
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">Issue Boards</h1>
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">Issue Boards</h1>
        <div className="text-destructive">Error loading boards. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Issue Boards</h1>
      <BoardsGrid boards={boards} />
    </div>
  );
}
