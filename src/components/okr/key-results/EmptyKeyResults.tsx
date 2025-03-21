
import React from 'react';
import { PlusCircle } from 'lucide-react';

interface EmptyKeyResultsProps {
  objectiveId: string;
}

export const EmptyKeyResults = ({ objectiveId }: EmptyKeyResultsProps) => {
  return (
    <div className="text-center py-6">
      <div className="flex justify-center mb-2">
        <PlusCircle className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-medium mb-1">No key results yet</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Add key results to track progress toward this objective
      </p>
    </div>
  );
};
