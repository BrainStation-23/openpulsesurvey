
export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  
  // Sort the values in ascending order
  const sortedValues = [...values].sort((a, b) => a - b);
  
  const midpoint = Math.floor(sortedValues.length / 2);
  
  // If the array has an odd number of elements
  if (sortedValues.length % 2 !== 0) {
    return sortedValues[midpoint];
  }
  
  // If the array has an even number of elements, average the two middle values
  return (sortedValues[midpoint - 1] + sortedValues[midpoint]) / 2;
}
