
/**
 * Calculate the median of an array of numbers
 * @param ratings Array of numbers to calculate median from
 * @returns Median value
 */
export const calculateMedian = (ratings: number[]): number => {
  if (ratings.length === 0) return 0;
  const sorted = [...ratings].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
};
