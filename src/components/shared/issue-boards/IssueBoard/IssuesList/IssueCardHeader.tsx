import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, Edit2, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { IssueCardProps } from "../../types";

interface IssueCardHeaderProps {
  issue: IssueCardProps['issue'];
  onViewDetails: () => void;
  canEdit: boolean;
  onStartEdit: () => void;
  onRequestDelete: () => void;
  isDeletePending: boolean;
}

export function IssueCardHeader({
  issue,
  onViewDetails,
  canEdit,
  onStartEdit,
  onRequestDelete,
  isDeletePending,
}: IssueCardHeaderProps) {
  const authorName = issue.profiles?.first_name
    ? `${issue.profiles.first_name} ${issue.profiles.last_name || ''}`.trim()
    : issue.profiles?.email || 'Unknown User';

  // Score indicator and label color by vote ratio
  const totalVotes = (issue.vote_count || 0) + (issue.downvote_count || 0);
  const getScoreIndicator = () => {
    if (totalVotes === 0) return null;
    const upvoteRatio = (issue.vote_count || 0) / totalVotes;
    const score = Math.round(upvoteRatio * 100);
    let indicatorColor = "bg-gray-500";
    if (upvoteRatio >= 0.8) indicatorColor = "bg-green-500";
    else if (upvoteRatio >= 0.6) indicatorColor = "bg-emerald-500";
    else if (upvoteRatio >= 0.4) indicatorColor = "bg-yellow-500";
    else if (upvoteRatio >= 0.2) indicatorColor = "bg-orange-500";
    else indicatorColor = "bg-red-500";
    return (
      <div className="flex items-center gap-1">
        <div className={cn("w-2 h-2 rounded-full", indicatorColor)} />
        <span className="text-xs font-medium text-muted-foreground">{score}%</span>
      </div>
    );
  };

  return (
    <div className="flex flex-row items-start justify-between space-y-0 w-full">
      <div className="flex-1">
        <h3 className="font-semibold leading-none tracking-tight text-lg">
          {issue.title}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Created {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
          {` by ${authorName}`}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {getScoreIndicator()}
        <Button variant="ghost" size="sm" onClick={onViewDetails}>
          <Eye className="h-4 w-4" />
        </Button>
        {canEdit && (
          <>
            <Button variant="ghost" size="sm" onClick={onStartEdit}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRequestDelete}
              disabled={isDeletePending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
