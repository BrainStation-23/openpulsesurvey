
import type { Issue as BaseIssue, UserIssueBoard as BaseBoard } from "@/pages/user/issue-boards/types";

// Extend the base types with our specific needs
export interface Issue extends Omit<BaseIssue, 'has_voted'> {
  has_voted: { id: string }[] | null;
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
  onVote?: (issueId: string) => void;
}

export interface VoteButtonProps {
  issueId: string;
  voteCount: number;
  hasVoted: boolean;
  onVote?: (issueId: string) => void;
  disabled?: boolean;
}

export interface CreateIssueButtonProps {
  boardId: string;
  onIssueCreated?: () => void;
}
