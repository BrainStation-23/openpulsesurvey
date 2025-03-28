
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const LoadingState: React.FC = () => {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="h-[400px] border rounded-md flex items-center justify-center">
          <div className="text-center space-y-3">
            <LoadingSpinner size={36} />
            <p className="text-sm text-muted-foreground">Loading team data...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
