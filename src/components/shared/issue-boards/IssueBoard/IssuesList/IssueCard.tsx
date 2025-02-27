
import React from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VoteButton } from "./VoteButton";
import type { IssueCardProps } from "../../types";

export function IssueCard({ 
  issue, 
  canVote,
  hasVoted,
  onVote 
}: IssueCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-semibold">{issue.title}</h3>
          <Badge variant={issue.status === 'open' ? 'default' : 'secondary'}>
            {issue.status}
          </Badge>
        </div>
      </CardHeader>
      {issue.description && (
        <CardContent>
          <p className="text-sm text-muted-foreground">{issue.description}</p>
        </CardContent>
      )}
      <CardFooter className="flex justify-between">
        <VoteButton
          issueId={issue.id}
          voteCount={issue.vote_count}
          hasVoted={hasVoted}
          onVote={onVote}
          disabled={!canVote}
        />
      </CardFooter>
    </Card>
  );
}
