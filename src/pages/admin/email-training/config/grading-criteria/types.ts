
export interface GradingCriteria {
  id: string;
  name: string;
  max_points: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface GradingCriteriaFormData {
  name: string;
  max_points: number;
}
