
import { CreateKeyResultInput, UpdateKeyResultInput } from '@/types/okr';

// Database constraints: assuming numeric columns have precision 5, scale 2
// This means values can range from -999.99 to 999.99
const MAX_NUMERIC_VALUE = 999.99;
const MIN_NUMERIC_VALUE = -999.99;

/**
 * Validates key result input data to ensure it meets database constraints
 * 
 * @param keyResultData - Data for creating or updating a key result
 * @throws Error if validation fails
 */
export const validateKeyResultData = (
  keyResultData: CreateKeyResultInput | (UpdateKeyResultInput & { id?: string })
): void => {
  // Validate progress value if provided
  if (keyResultData.progress !== undefined) {
    if (keyResultData.progress < 0 || keyResultData.progress > 100) {
      throw new Error("Progress value must be between 0 and 100");
    }
  }

  // Validate other numeric fields based on measurement type
  if (keyResultData.startValue !== undefined) {
    if (keyResultData.startValue < MIN_NUMERIC_VALUE || keyResultData.startValue > MAX_NUMERIC_VALUE) {
      throw new Error(`Start value must be between ${MIN_NUMERIC_VALUE} and ${MAX_NUMERIC_VALUE}`);
    }
  }

  if (keyResultData.currentValue !== undefined) {
    if (keyResultData.currentValue < MIN_NUMERIC_VALUE || keyResultData.currentValue > MAX_NUMERIC_VALUE) {
      throw new Error(`Current value must be between ${MIN_NUMERIC_VALUE} and ${MAX_NUMERIC_VALUE}`);
    }
  }

  if (keyResultData.targetValue !== undefined) {
    if (keyResultData.targetValue < MIN_NUMERIC_VALUE || keyResultData.targetValue > MAX_NUMERIC_VALUE) {
      throw new Error(`Target value must be between ${MIN_NUMERIC_VALUE} and ${MAX_NUMERIC_VALUE}`);
    }
  }

  if (keyResultData.weight !== undefined) {
    if (keyResultData.weight < MIN_NUMERIC_VALUE || keyResultData.weight > MAX_NUMERIC_VALUE) {
      throw new Error(`Weight value must be between ${MIN_NUMERIC_VALUE} and ${MAX_NUMERIC_VALUE}`);
    }
  }
}

/**
 * Calculates progress based on current, start and target values
 * 
 * @param currentValue - Current value of the key result
 * @param startValue - Starting value of the key result 
 * @param targetValue - Target value of the key result
 * @returns Calculated progress between 0-100
 */
export const calculateProgress = (
  currentValue: number,
  startValue: number,
  targetValue: number
): number => {
  // If target equals start, either return 0 or 100 based on whether current has reached target
  if (targetValue === startValue) {
    return currentValue >= targetValue ? 100 : 0;
  }

  // Calculate progress as percentage of the way from start to target
  const progress = ((currentValue - startValue) / (targetValue - startValue)) * 100;
  
  // Ensure progress is between 0-100
  return Math.min(Math.max(0, progress), 100);
}
