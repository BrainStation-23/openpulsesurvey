
import { KeyResultStatus } from '@/types/okr';

export const getProgressBarColor = (progress: number, status: KeyResultStatus): string => {
  if (status === 'at_risk') return "bg-red-500";
  if (status === 'completed') return "bg-purple-500";
  if (progress >= 75) return "bg-green-500";
  if (progress >= 50) return "bg-blue-500";
  if (progress >= 25) return "bg-amber-500";
  return "bg-gray-500";
};

export const getProgressDisplay = (
  measurementType: string,
  booleanValue?: boolean,
  currentValue?: number,
  targetValue?: number,
  unit?: string
): string => {
  if (measurementType === 'boolean') {
    return booleanValue ? 'Completed' : 'Not Completed';
  }

  let displayUnit = '';
  if (measurementType === 'percentage') {
    displayUnit = '%';
  } else if (measurementType === 'currency') {
    displayUnit = '$';
  } else if (unit) {
    displayUnit = unit + ' ';
  }

  return `${displayUnit}${currentValue} / ${displayUnit}${targetValue}`;
};
