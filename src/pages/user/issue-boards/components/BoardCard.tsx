
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { UserIssueBoard } from "../types";

interface BoardCardProps {
  board: UserIssueBoard;
}

export function BoardCard({ board }: BoardCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-semibold mb-2">{board.name}</h3>
      {board.description && (
        <p className="text-sm text-muted-foreground mb-4">
          {board.description}
        </p>
      )}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {board.permissions.can_create && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              Can Create
            </span>
          )}
          {board.permissions.can_vote && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Can Vote
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/user/issue-boards/${board.id}`)}
        >
          View Board
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </Card>
  );
}
