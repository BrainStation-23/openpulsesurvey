
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
