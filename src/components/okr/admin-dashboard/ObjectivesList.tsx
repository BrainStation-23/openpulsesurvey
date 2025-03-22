
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Objective } from '@/types/okr';
import { ObjectiveCard } from './ObjectiveCard';

interface ObjectivesListProps {
  objectives: Objective[];
  activeCycleName?: string;
  isLoading: boolean;
}

export const ObjectivesList = ({ objectives, activeCycleName, isLoading }: ObjectivesListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Objectives</CardTitle>
        <CardDescription>
          {activeCycleName ? `Showing objectives for ${activeCycleName}` : 'No active cycle found'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full mb-4"></div>
                <div className="h-2 bg-muted rounded w-full"></div>
              </Card>
            ))}
          </div>
        ) : objectives.length > 0 ? (
          <div className="space-y-4">
            {objectives.map(objective => (
              <ObjectiveCard key={objective.id} objective={objective} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No objectives found for the current cycle.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
