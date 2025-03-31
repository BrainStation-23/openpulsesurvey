
import React from 'react';
import { KeyResult } from '@/types/okr';
import { getProgressDisplay } from '../utils/progressBarUtils';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface KeyResultProgressDisplayProps {
  keyResult: KeyResult;
}

export const KeyResultProgressDisplay: React.FC<KeyResultProgressDisplayProps> = ({ keyResult }) => {
  return (
    <div className="mt-3 mb-2">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <span className="text-sm font-semibold">{keyResult.progress.toFixed(0)}% complete</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{getProgressDisplay(
            keyResult.measurementType,
            keyResult.booleanValue,
            keyResult.currentValue,
            keyResult.targetValue,
            keyResult.unit
          )}</span>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="bg-gray-50 text-gray-700 cursor-help">
                  <Info className="h-3 w-3 mr-1" />
                  Weight: {(keyResult.weight * 100).toFixed(0)}%
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>This key result contributes {(keyResult.weight * 100).toFixed(0)}% to the objective's overall progress</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};
