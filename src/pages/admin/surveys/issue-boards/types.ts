
export type IssueBoard = {
  id: string;
  name: string;
  description: string | null;
  status: 'active' | 'disabled';  // Changed from 'archived' to 'disabled'
  created_at: string;
  created_by: string;
};

export type IssueBoardPermission = {
  id: string;
  board_id: string;
  sbu_id?: string;
  location_id?: string;
  level_id?: string;
  employment_type_id?: string;
  employee_type_id?: string;
  employee_role_id?: string;
  can_view: boolean;
  can_create: boolean;
  can_vote: boolean;
};
