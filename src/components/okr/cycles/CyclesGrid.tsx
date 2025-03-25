
import React from 'react';
import { CycleCard } from './CycleCard';
import { OKRCycle } from '@/types/okr';

interface CyclesGridProps {
  cycles: OKRCycle[];
  isLoading: boolean;
}

export const CyclesGrid = ({ cycles, isLoading }: CyclesGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!cycles?.length) {
    return (
      <div className="text-center p-8 border rounded-lg bg-background">
        <h3 className="text-lg font-medium">No OKR cycles found</h3>
        <p className="text-muted-foreground mt-2">
          Create your first OKR cycle to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cycles.map((cycle) => (
        <CycleCard key={cycle.id} cycle={cycle} />
      ))}
    </div>
  );
};
