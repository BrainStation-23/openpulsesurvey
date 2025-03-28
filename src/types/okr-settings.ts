
export interface OkrRoleSettings {
  id?: string;
  can_create_objectives: string[];
  can_create_org_objectives: string[];
  can_create_dept_objectives: string[];
  can_create_team_objectives: string[];
  can_create_key_results: string[];
  can_create_alignments: string[];
  can_align_with_org_objectives: string[];
  can_align_with_dept_objectives: string[];
  can_align_with_team_objectives: string[];
  created_at?: string;
  updated_at?: string;
}

export type OkrPermissionType =
  | 'create_objectives'
  | 'create_org_objectives'
  | 'create_dept_objectives'
  | 'create_team_objectives'
  | 'create_key_results'
  | 'create_alignments'
  | 'align_with_org_objectives'
  | 'align_with_dept_objectives'
  | 'align_with_team_objectives';
