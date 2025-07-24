
import React from "react";
import { BoardsGrid } from "./components/BoardsGrid";
import { useIssueBoards } from "./hooks/useIssueBoards";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Kanban, MessageSquare } from "lucide-react";

export default function UserIssueBoards() {
  const { data: boards, isLoading, error } = useIssueBoards();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Kanban className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Issue Boards</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Collaborate on issues and provide feedback through structured boards
            </p>
          </div>
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Kanban className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Issue Boards</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Collaborate on issues and provide feedback through structured boards
            </p>
          </div>
          <div className="flex flex-col items-center justify-center py-16">
            <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
            <div className="text-destructive font-medium">Error loading boards</div>
            <p className="text-muted-foreground">Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Kanban className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Issue Boards</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Collaborate on issues and provide feedback through structured boards
          </p>
        </div>

        {/* Stats Bar */}
        {boards && boards.length > 0 && (
          <div className="flex items-center gap-6 px-4 py-3 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm font-medium">{boards.length} Board{boards.length !== 1 ? 's' : ''} Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm text-muted-foreground">
                {boards.filter(b => b.permissions.can_create).length} with Create Access
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-sm text-muted-foreground">
                {boards.filter(b => b.permissions.can_vote).length} with Vote Access
              </span>
            </div>
          </div>
        )}

        {/* Boards Grid */}
        <BoardsGrid boards={boards} />
      </div>
    </div>
  );
}
