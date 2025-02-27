
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import type { Board } from "../types";

interface BoardHeaderProps {
  board: Board;
  onBack: () => void;
}

export function BoardHeader({ board, onBack }: BoardHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" onClick={onBack}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <h1 className="text-xl font-semibold">{board.title}</h1>
    </div>
  );
}
