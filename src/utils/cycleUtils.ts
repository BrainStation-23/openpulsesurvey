
import { 
  format, 
  addMonths, 
  addYears, 
  startOfQuarter, 
  endOfQuarter, 
  startOfYear, 
  endOfYear, 
  startOfMonth, 
  endOfMonth,
  differenceInDays,
  differenceInMonths,
  isWithinInterval
} from 'date-fns';

export type CycleType = 'monthly' | 'quarterly' | 'yearly';

export const calculateCycleDates = (
  type: CycleType, 
  startDate: Date = new Date()
): { startDate: Date; endDate: Date } => {
  let start: Date;
  let end: Date;
  
  switch (type) {
    case 'monthly':
      start = startOfMonth(startDate);
      end = endOfMonth(start);
      break;
    case 'quarterly':
      start = startOfQuarter(startDate);
      end = endOfQuarter(start);
      break;
    case 'yearly':
      start = startOfYear(startDate);
      end = endOfYear(start);
      break;
    default:
      start = new Date(startDate);
      end = addMonths(start, 3);
  }
  
  return { startDate: start, endDate: end };
};

export const generateCycleName = (
  type: CycleType,
  startDate: Date = new Date()
): string => {
  const start = new Date(startDate);
  
  switch (type) {
    case 'monthly':
      return `${format(start, 'MMMM yyyy')}`;
    case 'quarterly':
      const quarter = Math.floor(start.getMonth() / 3) + 1;
      return `Q${quarter} ${start.getFullYear()}`;
    case 'yearly':
      return `${start.getFullYear()} Annual OKRs`;
    default:
      return `OKR Cycle ${format(start, 'MMM yyyy')}`;
  }
};

export const getCycleProgress = (startDate: Date, endDate: Date): number => {
  const now = new Date();
  
  // If not started yet
  if (now < startDate) return 0;
  
  // If already completed
  if (now > endDate) return 100;
  
  // Calculate progress percentage
  const totalDays = differenceInDays(endDate, startDate);
  const daysElapsed = differenceInDays(now, startDate);
  
  return Math.round((daysElapsed / totalDays) * 100);
};

export const isCycleActive = (startDate: Date, endDate: Date): boolean => {
  const now = new Date();
  return isWithinInterval(now, { start: startDate, end: endDate });
};

export const determineCycleType = (startDate: Date, endDate: Date): CycleType => {
  const monthsDiff = differenceInMonths(endDate, startDate);
  
  if (monthsDiff >= 11) return 'yearly';
  if (monthsDiff >= 2) return 'quarterly';
  return 'monthly';
};

export const getCycleColor = (cycleType: CycleType): string => {
  switch (cycleType) {
    case 'yearly':
      return 'blue';
    case 'quarterly':
      return 'green';
    case 'monthly':
      return 'amber';
    default:
      return 'gray';
  }
};
