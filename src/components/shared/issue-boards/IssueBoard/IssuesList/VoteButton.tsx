
import React from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";
import type { VoteButtonProps } from "../../types";

export function VoteButton({ 
  issueId, 
  voteCount, 
  hasVoted, 
  onVote,
  disabled 
}: VoteButtonProps) {
  return (
    <Button
      variant={hasVoted ? "default" : "outline"}
      size="sm"
      className="gap-2"
      onClick={() => onVote?.(issueId)}
      disabled={disabled}
    >
      <ThumbsUp className="h-4 w-4" />
      <span>{voteCount}</span>
    </Button>
  );
}
