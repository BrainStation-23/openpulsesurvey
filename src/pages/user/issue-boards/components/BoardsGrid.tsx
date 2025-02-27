
import React from "react";
import { Card } from "@/components/ui/card";
import { BoardCard } from "./BoardCard";
import type { UserIssueBoard } from "../types";

interface BoardsGridProps {
  boards: UserIssueBoard[] | undefined;
}

export function BoardsGrid({ boards }: BoardsGridProps) {
  if (!boards || boards.length === 0) {
    return (
      <Card className="p-6 col-span-full">
        <p className="text-center text-muted-foreground">
          No issue boards available.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {boards.map((board) => (
        <BoardCard key={board.id} board={board} />
      ))}
    </div>
  );
}
