export type ComparisonDimension = 'sbu' | 'gender' | 'location' | 'employment_type' | 'main';

export interface ComparisonProps {
  dimension: ComparisonDimension;
  onDimensionChange: (dimension: ComparisonDimension) => void;
}