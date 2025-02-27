
import React from "react";
import { useIssues } from "../../hooks/useIssues";
import { IssueCard } from "./IssueCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useVoting } from "../../hooks/useVoting";

interface IssuesListProps {
  boardId: string;
  canVote: boolean;
}

export function IssuesList({ boardId, canVote }: IssuesListProps) {
  const { data: issues, isLoading } = useIssues(boardId);
  const { mutate: vote } = useVoting();

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!issues || issues.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No issues have been created yet.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {issues.map((issue) => (
        <IssueCard
          key={issue.id}
          issue={issue}
          canVote={canVote}
          hasVoted={Boolean(issue.has_voted && issue.has_voted.length > 0)}
          onVote={vote}
        />
      ))}
    </div>
  );
}
