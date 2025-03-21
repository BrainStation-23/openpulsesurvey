
import { CreateKeyResultInput, UpdateKeyResultInput } from '@/types/okr';

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
  
  // Add additional validations as needed
}
