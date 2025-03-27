
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Globe, Users, User } from 'lucide-react';

type ObjectiveVisibility = 'private' | 'team' | 'department' | 'organization';

interface ObjectiveVisibilityBadgeProps {
  visibility: ObjectiveVisibility;
  className?: string;
}

export const ObjectiveVisibilityBadge: React.FC<ObjectiveVisibilityBadgeProps> = ({ 
  visibility, 
  className = '' 
}) => {
  const visibilityConfig = {
    private: {
      icon: User,
      label: 'Private',
      variant: 'outline',
    },
    team: {
      icon: Users,
      label: 'Team',
      variant: 'secondary',
    },
    department: {
      icon: Users,
      label: 'Department',
      variant: 'default',
    },
    organization: {
      icon: Globe,
      label: 'Organization',
      variant: 'destructive',
    },
  };

  const config = visibilityConfig[visibility] || visibilityConfig.private;
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
