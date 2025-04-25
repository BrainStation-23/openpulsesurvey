export type ComparisonDimension = "none" | "sbu" | "gender" | "location" | "employment_type" | "level" | "employee_type" | "employee_role" | "supervisor";

export interface DimensionComparisonData {
  dimension: string;
  unsatisfied: number;
  neutral: number;
  satisfied: number;
  total: number;
  avg_score: number;
}

export interface BooleanComparisonData {
  dimension: string;
  yes_count: number;
  no_count: number;
  total_count: number;
}

export interface NpsComparisonData {
  dimension: string;
  detractors: number;
  passives: number;
  promoters: number;
  total: number;
  nps_score: number;
  avg_score?: number;
}
