
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { ObjectiveStatus } from '@/types/okr';

interface StatusBadgeProps {
  status: ObjectiveStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  let color = '';
  
  switch (status) {
    case 'completed':
      color = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      break;
    case 'at_risk':
      color = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      break;
    case 'on_track':
      color = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      break;
    case 'in_progress':
      color = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      break;
    default:
      color = 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
  }
  
  return (
    <Badge variant="outline" className={color}>
      {formatStatus(status)}
    </Badge>
  );
};

export const formatStatus = (status: ObjectiveStatus): string => {
  switch (status) {
    case 'in_progress': return 'In Progress';
    case 'at_risk': return 'At Risk';
    case 'on_track': return 'On Track';
    case 'completed': return 'Completed';
    default: return 'Draft';
  }
};
