
/**
 * Calculate the median value from an array of numbers
 * @param values Array of numeric values
 * @returns The median value
 */
export const calculateMedian = (values: number[]): number => {
  if (!values.length) return 0;
  
  // Sort the values in ascending order
  const sortedValues = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sortedValues.length / 2);
  
  // If the length is odd, return the middle value
  if (sortedValues.length % 2 === 1) {
    return sortedValues[middle];
  }
  
  // If the length is even, return the average of the two middle values
  return (sortedValues[middle - 1] + sortedValues[middle]) / 2;
};
