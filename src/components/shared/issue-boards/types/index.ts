
import { Issue, UserIssueBoard } from "@/pages/user/issue-boards/types";

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
  hasVoted?: boolean;
  onVote?: (issueId: string) => void;
}

export interface VoteButtonProps {
  issueId: string;
  voteCount: number;
  hasVoted?: boolean;
  onVote?: (issueId: string) => void;
  disabled?: boolean;
}

export interface CreateIssueButtonProps {
  boardId: string;
  onIssueCreated?: () => void;
}
