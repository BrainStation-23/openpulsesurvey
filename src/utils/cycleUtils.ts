
import { OKRCycle } from '@/types/okr';
import { format } from 'date-fns';

export const formatCycleDate = (date: Date): string => {
  return format(date, 'MMM d, yyyy');
};

export const isCycleActive = (cycle: OKRCycle): boolean => {
  const now = new Date();
  return now >= cycle.startDate && now <= cycle.endDate;
};

export const getCycleType = (startDate: Date, endDate: Date): string => {
  const monthsDiff = endDate.getMonth() - startDate.getMonth() + 
    (12 * (endDate.getFullYear() - startDate.getFullYear()));
  
  if (monthsDiff >= 11) return 'Yearly';
  if (monthsDiff >= 2) return 'Quarterly';
  return 'Monthly';
};

export const getCycleProgress = (startDate: Date, endDate: Date): number => {
  const now = new Date();
  if (now < startDate) return 0;
  if (now > endDate) return 100;
  
  const total = endDate.getTime() - startDate.getTime();
  const elapsed = now.getTime() - startDate.getTime();
  return Math.round((elapsed / total) * 100);
};

// Add the missing utility functions below

export type CycleType = 'monthly' | 'quarterly' | 'yearly';

// Function to determine the type of a cycle
export const determineCycleType = (startDate: Date, endDate: Date): CycleType => {
  const monthsDiff = endDate.getMonth() - startDate.getMonth() + 
    (12 * (endDate.getFullYear() - startDate.getFullYear()));
  
  if (monthsDiff >= 11) return 'yearly';
  if (monthsDiff >= 2) return 'quarterly';
  return 'monthly';
};

// Function to get the color for each cycle type
export const getCycleColor = (cycleType: CycleType): string => {
  switch (cycleType) {
    case 'yearly':
      return 'purple';
    case 'quarterly':
      return 'blue';
    case 'monthly':
      return 'green';
    default:
      return 'gray';
  }
};

// Function to calculate start and end dates based on cycle type
export const calculateCycleDates = (cycleType: CycleType, startDate: Date): { startDate: Date, endDate: Date } => {
  const result = {
    startDate: new Date(startDate),
    endDate: new Date(startDate)
  };
  
  switch (cycleType) {
    case 'yearly':
      result.endDate.setFullYear(result.endDate.getFullYear() + 1);
      result.endDate.setDate(result.endDate.getDate() - 1);
      break;
    case 'quarterly':
      result.endDate.setMonth(result.endDate.getMonth() + 3);
      result.endDate.setDate(result.endDate.getDate() - 1);
      break;
    case 'monthly':
      result.endDate.setMonth(result.endDate.getMonth() + 1);
      result.endDate.setDate(result.endDate.getDate() - 1);
      break;
  }
  
  return result;
};

// Function to generate a name for a cycle based on its type and start date
export const generateCycleName = (cycleType: CycleType, startDate: Date): string => {
  const year = startDate.getFullYear();
  
  switch (cycleType) {
    case 'yearly':
      return `Year ${year}`;
    case 'quarterly':
      const quarter = Math.floor(startDate.getMonth() / 3) + 1;
      return `Q${quarter} ${year}`;
    case 'monthly':
      return format(startDate, 'MMMM yyyy');
    default:
      return `Cycle ${format(startDate, 'MMM yyyy')}`;
  }
};
