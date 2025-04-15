
// We use these dimensions for creating comparison slides
export const COMPARISON_DIMENSIONS = [
  "sbu", 
  "gender", 
  "location", 
  "employment_type",
  "level",
  "employee_type",
  "employee_role",
  "supervisor"
] as const;

export type ComparisonDimension = typeof COMPARISON_DIMENSIONS[number];
