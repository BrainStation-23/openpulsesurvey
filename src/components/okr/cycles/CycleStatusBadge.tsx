
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { OKRCycleStatus } from '@/types/okr';

interface CycleStatusBadgeProps {
  status: OKRCycleStatus;
  className?: string;
}

export const CycleStatusBadge = ({ status, className }: CycleStatusBadgeProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'bg-green-500 hover:bg-green-600';
      case 'upcoming':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'completed':
        return 'bg-gray-500 hover:bg-gray-600';
      case 'archived':
        return 'bg-yellow-500 hover:bg-yellow-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <Badge className={`${getStatusColor()} ${className || ''}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};
