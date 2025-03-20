
import React from 'react';
import { ObjectiveCard } from './ObjectiveCard';
import { Objective } from '@/types/okr';

interface ObjectivesGridProps {
  objectives: Objective[];
  isLoading: boolean;
  isAdmin?: boolean;
}

export const ObjectivesGrid = ({ objectives, isLoading, isAdmin = false }: ObjectivesGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!objectives?.length) {
    return (
      <div className="text-center p-8 border rounded-lg bg-background">
        <h3 className="text-lg font-medium">No objectives found</h3>
        <p className="text-muted-foreground mt-2">
          Create your first objective to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {objectives.map((objective) => (
        <ObjectiveCard key={objective.id} objective={objective} isAdmin={isAdmin} />
      ))}
    </div>
  );
};
