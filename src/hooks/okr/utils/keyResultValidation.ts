
import { CreateKeyResultInput, UpdateKeyResultInput, MeasurementType } from '@/types/okr';

// Database constraints: assuming numeric columns have precision 10, scale 2
// This means values can range from -99999999.99 to 99999999.99
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
  // Get the measurement type from the data or use a default
  const measurementType = keyResultData.measurementType || 'numeric';

  // Validate progress value if provided
  if (keyResultData.progress !== undefined) {
    if (keyResultData.progress < 0 || keyResultData.progress > 100) {
      // Clamp progress between 0-100 instead of throwing an error
      keyResultData.progress = Math.max(0, Math.min(100, keyResultData.progress));
    }
  }

  // Skip numeric validation for boolean measurement type
  if (measurementType === 'boolean') {
    // For boolean type, we only need to ensure booleanValue is defined if it's a create operation
    if ('objectiveId' in keyResultData && keyResultData.booleanValue === undefined) {
      throw new Error("Boolean value must be provided for yes/no measurement type");
    }
    return;
  }

  // For numeric measurement types, validate the values
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
 * Calculates progress based on measurement type, values, and boolean state
 * 
 * @param measurementType - Type of measurement for the key result
 * @param currentValue - Current value of the key result 
 * @param startValue - Starting value of the key result
 * @param targetValue - Target value of the key result
 * @param booleanValue - Boolean value for yes/no key results
 * @returns Calculated progress between 0-100
 */
export const calculateProgress = (
  measurementType: MeasurementType,
  currentValue?: number,
  startValue?: number,
  targetValue?: number,
  booleanValue?: boolean
): number => {
  // Handle boolean measurement type
  if (measurementType === 'boolean') {
    return booleanValue ? 100 : 0;
  }

  // Default values if undefined
  const start = startValue ?? 0;
  const current = currentValue ?? 0;
  const target = targetValue ?? 0;

  // If target equals start, either return 0 or 100 based on whether current has reached target
  if (target === start) {
    return current >= target ? 100 : 0;
  }

  // Calculate progress as percentage of the way from start to target
  const progress = ((current - start) / (target - start)) * 100;
  
  // Ensure progress is between 0-100
  return Math.min(Math.max(0, progress), 100);
}
