
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ProgressCardProps {
  progress: number;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({ progress }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500">Progress</h3>
          <span className="font-medium">{progress.toFixed(2)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </CardContent>
    </Card>
  );
};
