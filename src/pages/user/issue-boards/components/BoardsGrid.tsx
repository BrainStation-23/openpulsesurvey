
import React from "react";
import { Card } from "@/components/ui/card";
import { BoardCard } from "./BoardCard";
import { Kanban, Plus } from "lucide-react";
import type { UserIssueBoard } from "../types";

interface BoardsGridProps {
  boards: UserIssueBoard[] | undefined;
}

export function BoardsGrid({ boards }: BoardsGridProps) {
  if (!boards || boards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-6">
            <Kanban className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <Plus className="h-4 w-4 text-primary" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No Issue Boards Available</h3>
        <p className="text-muted-foreground text-center max-w-md">
          There are currently no issue boards that you have access to. Contact your administrator to request access.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {boards.map((board) => (
        <BoardCard key={board.id} board={board} />
      ))}
    </div>
  );
}
