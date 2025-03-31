
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
  
  // If the key result is completed, we may still want to show the due date with a different style
  const colorClass = isCompleted 
    ? "bg-green-50 text-green-700" 
    : getDueDateColorClass(dueDate);
    
  const formattedDate = formatDueDate(dueDate);
  const isPast = isPastDue(dueDate) && !isCompleted;
  
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
