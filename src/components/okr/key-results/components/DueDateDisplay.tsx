
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CalendarClock } from 'lucide-react';
import { getDueDateColorClass, formatDueDate, isPastDue } from '../utils/dueDateUtils';

interface DueDateDisplayProps {
  dueDate?: Date | string;
  isCompleted?: boolean;
  showIcon?: boolean;
  className?: string;
}

export const DueDateDisplay: React.FC<DueDateDisplayProps> = ({
  dueDate,
  isCompleted = false,
  showIcon = true,
  className = ''
}) => {
  // Don't display if no due date
  if (!dueDate) return null;
  
  // Don't display due date for completed key results if configured that way
  if (isCompleted) return null;

  const colorClass = getDueDateColorClass(dueDate);
  const formattedDate = formatDueDate(dueDate);
  const isPast = isPastDue(dueDate);
  
  return (
    <Badge 
      variant="outline" 
      className={`${colorClass} ${className} flex items-center gap-1`}
    >
      {showIcon && <CalendarClock className="h-3 w-3" />}
      <span>{formattedDate}</span>
      {isPast && <span className="font-semibold">(Overdue)</span>}
    </Badge>
  );
};
