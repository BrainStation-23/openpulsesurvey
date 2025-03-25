
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Objective } from '@/types/okr';
import { StatusBadge } from './StatusBadge';
import { useKeyResults } from '@/hooks/okr/useKeyResults';
import { User, ListChecks } from 'lucide-react';
import { useOwnerInfo } from '@/components/okr/key-results/hooks/useOwnerInfo';

interface ObjectiveCardProps {
  objective: Objective;
  childCount?: number;
}

export const ObjectiveCard = ({ objective, childCount = 0 }: ObjectiveCardProps) => {
  const { data: keyResults, isLoading: isLoadingKeyResults } = useKeyResults(objective.id);
  const { ownerName } = useOwnerInfo(objective.ownerId);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">{objective.title}</h3>
            <StatusBadge status={objective.status} />
          </div>
          
          {objective.description && (
            <p className="text-sm text-muted-foreground">{objective.description}</p>
          )}
          
          <div className="pt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium">Progress: {Math.round(objective.progress)}%</span>
            </div>
            <Progress value={objective.progress} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-muted-foreground">
            <div className="flex items-center">
              <User className="h-3.5 w-3.5 mr-1.5" />
              <span className="truncate">{ownerName}</span>
            </div>
            
            <div className="flex items-center justify-end">
              <ListChecks className="h-3.5 w-3.5 mr-1.5" />
              <span>{isLoadingKeyResults ? '...' : keyResults?.length || 0} KRs</span>
            </div>
            
            {childCount > 0 && (
              <div className="col-span-2 text-xs">
                <span>{childCount} Child Objectives</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
