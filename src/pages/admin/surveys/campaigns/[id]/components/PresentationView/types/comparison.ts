
export type ComparisonDimension = 'main' | 'sbu' | 'gender' | 'location' | 'employment_type' | 'level' | 'employee_type' | 'employee_role' | 'supervisor' | 'generation' | 'none';

export interface RadioGroupComparisonData {
  dimension: string;
  choice_data: Array<{
    choice_value: string;
    choice_text: string;
    count: number;
    percentage: number;
  }>;
}
