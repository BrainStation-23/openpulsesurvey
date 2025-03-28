
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, UserCircle2, Briefcase, Users, Shield, Layers } from 'lucide-react';
import { UserNodeData } from '../types';

interface CustomNodeProps {
  data: UserNodeData;
  toggleNodeExpansion: (userId: string) => void;
}

export const CustomNode = ({ data, toggleNodeExpansion }: CustomNodeProps) => {
  return (
    <Card className="w-full">
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          {data.hasChildren && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => toggleNodeExpansion(data.userId)}
            >
              {data.isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <UserCircle2 className="h-5 w-5 text-muted-foreground" />
              <div className="font-medium text-base">{data.label}</div>
            </div>
            <div className="text-sm text-muted-foreground">{data.subtitle}</div>
            <div className="text-xs text-muted-foreground mt-1">{data.email}</div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {data.employmentType && (
            <Badge 
              style={{ backgroundColor: data.employmentType.color_code }}
              className="flex items-center gap-1"
            >
              <Briefcase className="h-3 w-3" />
              {data.employmentType.name}
            </Badge>
          )}
          {data.employeeType && (
            <Badge 
              style={{ backgroundColor: data.employeeType.color_code }}
              className="flex items-center gap-1"
            >
              <Users className="h-3 w-3" />
              {data.employeeType.name}
            </Badge>
          )}
          {data.employeeRole && (
            <Badge 
              style={{ backgroundColor: data.employeeRole.color_code }}
              className="flex items-center gap-1"
            >
              <Shield className="h-3 w-3" />
              {data.employeeRole.name}
            </Badge>
          )}
          {data.level && (
            <Badge 
              style={{ backgroundColor: data.level.color_code }}
              className="flex items-center gap-1"
            >
              <Layers className="h-3 w-3" />
              {data.level.name}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
};
