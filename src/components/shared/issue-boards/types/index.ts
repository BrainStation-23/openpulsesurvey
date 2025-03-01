import type { Issue as BaseIssue, UserIssueBoard as BaseBoard } from "@/pages/user/issue-boards/types";

// Extend the base types with our specific needs
export interface Issue extends Omit<BaseIssue, 'has_voted'> {
  has_voted: { id: string }[] | null;
  has_downvoted: { id: string }[] | null;
  downvote_count: number;
}

export interface UserIssueBoard extends Omit<BaseBoard, 'permissions'> {
  permissions: {
    can_view: boolean;
    can_create: boolean;
    can_vote: boolean;
  }[];
}

export interface BoardViewProps {
  boardId: string;
}

export interface BoardHeaderProps {
  board: UserIssueBoard;
  onBack?: () => void;
}

export interface IssueCardProps {
  issue: Issue;
  canVote: boolean;
  hasVoted: boolean;
}

export interface VoteButtonProps {
  issueId: string;
  voteCount: number;
  downvoteCount: number;
  hasVoted: boolean;
  hasDownvoted: boolean;
  onVote?: (issueId: string) => void;
  onDownvote?: (issueId: string) => void;
  disabled?: boolean;
}

export interface CreateIssueButtonProps {
  boardId: string;
  onIssueCreated?: () => void;
}
