
export interface UserIssueBoard {
  id: string;
  name: string;
  description: string | null;
  status: 'active' | 'disabled';
  created_at: string;
  created_by: string;
  permissions: {
    can_view: boolean;
    can_create: boolean;
    can_vote: boolean;
  };
}

export interface Issue {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  created_by: string;
  board_id: string;
  vote_count: number;
  has_voted?: boolean;
  status: 'open' | 'closed';
}
