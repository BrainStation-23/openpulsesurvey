
export type IssueBoard = {
  id: string;
  name: string;
  description: string | null;
  status: 'active' | 'disabled';
  created_at: string;
  created_by: string;
};

export type IssueBoardPermission = {
  id: string;
  board_id: string;
  sbu_ids?: string[];
  level_ids?: string[];
  location_ids?: string[];
  employment_type_ids?: string[];
  employee_type_ids?: string[];
  employee_role_ids?: string[];
  can_view: boolean;
  can_create: boolean;
  can_vote: boolean;
  created_at: string;
  updated_at: string;
};
