
import React from 'react';
import { KeyResult } from '@/types/okr';
import { getProgressDisplay } from '../utils/progressBarUtils';

interface KeyResultProgressDisplayProps {
  keyResult: KeyResult;
}

export const KeyResultProgressDisplay: React.FC<KeyResultProgressDisplayProps> = ({ keyResult }) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium">Progress: {keyResult.progress.toFixed(0)}%</span>
        <span className="text-sm">{getProgressDisplay(
          keyResult.measurementType,
          keyResult.booleanValue,
          keyResult.currentValue,
          keyResult.targetValue,
          keyResult.unit
        )}</span>
      </div>
    </div>
  );
};
