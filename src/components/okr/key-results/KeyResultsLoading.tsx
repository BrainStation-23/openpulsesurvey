
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const KeyResultsLoading = () => {
  return (
    <div className="space-y-4">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
};
