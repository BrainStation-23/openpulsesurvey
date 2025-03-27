
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Eye, Users, Building, Globe } from 'lucide-react';

type ObjectiveVisibility = 'private' | 'team' | 'department' | 'organization';

interface ObjectiveVisibilityBadgeProps {
  visibility: ObjectiveVisibility;
  className?: string;
}

export const ObjectiveVisibilityBadge: React.FC<ObjectiveVisibilityBadgeProps> = ({ 
  visibility, 
  className = '' 
}) => {
  const getVisibilityConfig = () => {
    switch (visibility) {
      case 'private':
        return { 
          icon: <Eye className="h-3 w-3 mr-1" />,
          label: 'Private',
          variant: 'outline' as const
        };
      case 'team':
        return { 
          icon: <Users className="h-3 w-3 mr-1" />,
          label: 'Team',
          variant: 'secondary' as const
        };
      case 'department':
        return { 
          icon: <Building className="h-3 w-3 mr-1" />,
          label: 'Department',
          variant: 'default' as const
        };
      case 'organization':
        return { 
          icon: <Globe className="h-3 w-3 mr-1" />,
          label: 'Organization',
          variant: 'destructive' as const
        };
      default:
        return { 
          icon: <Eye className="h-3 w-3 mr-1" />,
          label: 'Unknown',
          variant: 'outline' as const
        };
    }
  };

  const config = getVisibilityConfig();
  
  return (
    <Badge variant={config.variant} className={`inline-flex items-center ${className}`}>
      {config.icon}
      {config.label}
    </Badge>
  );
};
