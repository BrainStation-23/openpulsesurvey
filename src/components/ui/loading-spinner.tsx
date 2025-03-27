
import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 24, 
  className 
}) => {
  return (
    <Loader2 
      className={cn("animate-spin", className)} 
      size={size} 
    />
  );
};
