
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { KeyResultStatus } from '@/types/okr';

interface KeyResultStatusBadgeProps {
  status: KeyResultStatus;
}

export const KeyResultStatusBadge: React.FC<KeyResultStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'not_started':
      return <Badge variant="outline" className="bg-slate-100">Not Started</Badge>;
    case 'in_progress':
      return <Badge variant="outline" className="bg-blue-100 text-blue-800">In Progress</Badge>;
    case 'at_risk':
      return <Badge variant="outline" className="bg-red-100 text-red-800">At Risk</Badge>;
    case 'on_track':
      return <Badge variant="outline" className="bg-green-100 text-green-800">On Track</Badge>;
    case 'completed':
      return <Badge variant="outline" className="bg-purple-100 text-purple-800">Completed</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};
