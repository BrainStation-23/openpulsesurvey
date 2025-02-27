
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { BoardHeaderProps } from "../types";

export function BoardHeader({ board, onBack }: BoardHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        {onBack && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        <h1 className="text-2xl font-bold">{board.name}</h1>
      </div>
      {board.description && (
        <p className="text-muted-foreground">{board.description}</p>
      )}
    </div>
  );
}
