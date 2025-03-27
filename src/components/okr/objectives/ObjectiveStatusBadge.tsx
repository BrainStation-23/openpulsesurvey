
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ObjectiveStatus } from '@/types/okr';

interface ObjectiveStatusBadgeProps {
  status: ObjectiveStatus;
  className?: string;
}

export const ObjectiveStatusBadge = ({ status, className }: ObjectiveStatusBadgeProps) => {
  const getVariant = () => {
    switch (status) {
      case 'draft':
        return 'outline';
      case 'in_progress':
        return 'default';
      case 'at_risk':
        return 'destructive';
      case 'on_track':
        return 'success';
      case 'completed':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Badge className={className} variant={getVariant()}>
      {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
    </Badge>
  );
};
