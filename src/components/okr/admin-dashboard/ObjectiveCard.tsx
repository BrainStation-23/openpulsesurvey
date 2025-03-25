
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Objective } from '@/types/okr';
import { StatusBadge } from './StatusBadge';

interface ObjectiveCardProps {
  objective: Objective;
}

export const ObjectiveCard = ({ objective }: ObjectiveCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
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
        </div>
      </CardContent>
    </Card>
  );
};
