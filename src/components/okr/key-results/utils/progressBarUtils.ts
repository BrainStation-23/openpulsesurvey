
import { KeyResult } from '@/types/okr';

/**
 * Get a display string for key result progress based on measurement type
 */
export const getProgressDisplay = (
  measurementType: string, 
  booleanValue?: boolean, 
  currentValue?: number, 
  targetValue?: number,
  unit?: string
): string => {
  if (measurementType === 'boolean') {
    return booleanValue ? 'Complete' : 'Incomplete';
  }
  
  const current = currentValue !== undefined ? currentValue : 0;
  const target = targetValue !== undefined ? targetValue : 0;
  
  if (measurementType === 'percentage') {
    return `${current}% / ${target}%`;
  }
  
  if (measurementType === 'currency') {
    return `$${current} / $${target}`;
  }
  
  if (unit) {
    return `${current} ${unit} / ${target} ${unit}`;
  }
  
  return `${current} / ${target}`;
};

/**
 * Calculate progress percentage safely
 */
export const calculateProgressPercentage = (keyResult: KeyResult): number => {
  if (keyResult.measurementType === 'boolean') {
    return keyResult.booleanValue ? 100 : 0;
  }
  
  if (keyResult.targetValue === keyResult.startValue) {
    return keyResult.currentValue >= keyResult.targetValue ? 100 : 0;
  }
  
  const progress = ((keyResult.currentValue - keyResult.startValue) / 
                   (keyResult.targetValue - keyResult.startValue)) * 100;
  
  return Math.min(Math.max(0, progress), 100);
};

/**
 * Format weight as a percentage string
 */
export const formatWeight = (weight: number): string => {
  return `${(weight * 100).toFixed(0)}%`;
};
