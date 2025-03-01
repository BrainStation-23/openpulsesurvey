
import React from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import type { VoteButtonProps } from "../../types";

export function VoteButton({ 
  issueId, 
  voteCount,
  downvoteCount,
  hasVoted,
  hasDownvoted,
  onVote,
  onDownvote,
  disabled 
}: VoteButtonProps) {
  return (
    <div className="flex gap-2">
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
      <Button
        variant={hasDownvoted ? "default" : "outline"}
        size="sm"
        className="gap-2"
        onClick={() => onDownvote?.(issueId)}
        disabled={disabled}
      >
        <ThumbsDown className="h-4 w-4" />
        <span>{downvoteCount}</span>
      </Button>
    </div>
  );
}
