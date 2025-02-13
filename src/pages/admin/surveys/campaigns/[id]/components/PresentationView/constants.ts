
export const COMPARISON_DIMENSIONS = [
  'sbu',
  'gender', 
  'location',
  'employment_type',
  'level',
  'employee_type',
  'employee_role'
] as const;

export const DIMENSION_TITLES = {
  sbu: "Response Distribution by Department",
  gender: "Response Distribution by Gender",
  location: "Response Distribution by Location",
  employment_type: "Response Distribution by Employment Type",
  level: "Response Distribution by Level",
  employee_type: "Response Distribution by Employee Type",
  employee_role: "Response Distribution by Employee Role",
  none: "No Comparison"
} as const;
