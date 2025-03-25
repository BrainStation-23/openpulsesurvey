
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { OKRCycleStatus } from '@/types/okr';

interface CycleStatusBadgeProps {
  status: OKRCycleStatus;
  className?: string;
}

export const CycleStatusBadge = ({ status, className }: CycleStatusBadgeProps) => {
  const getVariant = () => {
    switch (status) {
      case 'active':
        return 'success';
      case 'upcoming':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'archived':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <Badge className={className} variant={getVariant()}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};
