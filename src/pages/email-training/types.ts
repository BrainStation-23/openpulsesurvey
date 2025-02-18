
export type Scenario = {
  id: string;
  name: string;
  story: string;
  difficulty_level: number;
  tags: string[];
  status: 'active' | 'inactive' | 'draft';
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type EmailTrainingSession = {
  id: string;
  user_id: string;
  scenario_id: string;
  status: 'initial' | 'playing' | 'submitted';
  started_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
};
