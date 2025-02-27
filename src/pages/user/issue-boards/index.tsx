
import React from "react";
import { BoardsGrid } from "./components/BoardsGrid";
import { useIssueBoards } from "./hooks/useIssueBoards";

export default function UserIssueBoards() {
  const { data: boards, isLoading, error } = useIssueBoards();

  console.log('Component render state:', { isLoading, error, boardsCount: boards?.length });

  if (error) {
    console.error('Query error:', error);
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Issue Boards</h1>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Issue Boards</h1>
      <BoardsGrid boards={boards} />
    </div>
  );
}
