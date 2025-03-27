
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ObjectiveProgressProps {
  progress: number;
  className?: string;
}

export const ObjectiveProgress: React.FC<ObjectiveProgressProps> = ({ 
  progress, 
  className = '' 
}) => {
  // Ensure progress is a number between 0-100
  const normalizedProgress = Math.min(Math.max(0, progress || 0), 100);
  
  // Determine color based on progress
  const getProgressColor = () => {
    if (normalizedProgress < 33) return 'bg-red-500';
    if (normalizedProgress < 66) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Progress</span>
        <span className="text-sm font-medium">{normalizedProgress.toFixed(0)}%</span>
      </div>
      <Progress 
        value={normalizedProgress} 
        className="h-2"
        indicatorClassName={getProgressColor()}
      />
    </div>
  );
};
