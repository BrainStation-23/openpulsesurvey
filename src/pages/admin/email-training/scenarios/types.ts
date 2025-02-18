
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
