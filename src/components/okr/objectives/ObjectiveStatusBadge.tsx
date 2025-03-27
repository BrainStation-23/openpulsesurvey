
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Circle, CheckCircle, AlertCircle, Clock, PlayCircle, PauseCircle } from 'lucide-react';

export type ObjectiveStatus = 'draft' | 'pending' | 'in_progress' | 'on_hold' | 'completed' | 'canceled';

interface ObjectiveStatusBadgeProps {
  status: ObjectiveStatus;
  className?: string;
}

export const ObjectiveStatusBadge: React.FC<ObjectiveStatusBadgeProps> = ({ status, className = '' }) => {
  const statusConfig = {
    draft: {
      icon: Circle,
      label: 'Draft',
      variant: 'outline',
    },
    pending: {
      icon: Clock,
      label: 'Pending',
      variant: 'secondary',
    },
    in_progress: {
      icon: PlayCircle,
      label: 'In Progress',
      variant: 'default',
    },
    on_hold: {
      icon: PauseCircle,
      label: 'On Hold',
      variant: 'warning',
    },
    completed: {
      icon: CheckCircle,
      label: 'Completed',
      variant: 'success',
    },
    canceled: {
      icon: AlertCircle,
      label: 'Canceled',
      variant: 'destructive',
    },
  };

  const config = statusConfig[status] || statusConfig.draft;
  const Icon = config.icon;
  
  return (
    <Badge 
      variant={config.variant as any} 
      className={`flex items-center gap-1 ${className}`}
    >
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </Badge>
  );
};
