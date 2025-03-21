
import React, { useState } from 'react';
import { KeyResult } from '@/types/okr';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface KeyResultProgressControlsProps {
  keyResult: KeyResult;
  onProgressUpdate: (value: number) => void;
  onBooleanChange: (checked: boolean) => void;
  isPending: boolean;
}

export const KeyResultProgressControls: React.FC<KeyResultProgressControlsProps> = ({
  keyResult,
  onProgressUpdate,
  onBooleanChange,
  isPending
}) => {
  const [progressValue, setProgressValue] = useState<number>(keyResult.currentValue);

  const handleSliderChange = (value: number[]) => {
    setProgressValue(value[0]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      const bounded = Math.max(
        keyResult.startValue, 
        Math.min(keyResult.targetValue, value)
      );
      setProgressValue(bounded);
    }
  };

  const handleUpdate = () => {
    if (progressValue !== keyResult.currentValue) {
      onProgressUpdate(progressValue);
    }
  };

  if (keyResult.measurementType === 'boolean') {
    return (
      <div className="flex items-center justify-between mb-4 mt-2">
        <span className="text-sm font-medium">Completed</span>
        <Switch 
          checked={keyResult.booleanValue} 
          onCheckedChange={onBooleanChange}
          disabled={isPending}
        />
      </div>
    );
  }

  let unit = '';
  if (keyResult.measurementType === 'percentage') {
    unit = '%';
  } else if (keyResult.measurementType === 'currency') {
    unit = '$';
  } else if (keyResult.unit) {
    unit = keyResult.unit + ' ';
  }

  return (
    <div className="space-y-4 mb-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Current Value:</span>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={progressValue}
            onChange={handleInputChange}
            className="w-20 text-right"
            min={keyResult.startValue}
            max={keyResult.targetValue}
            step={keyResult.measurementType === 'percentage' ? 5 : 1}
            disabled={isPending}
          />
          <span className="text-sm w-4">{unit}</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleUpdate}
            disabled={isPending || progressValue === keyResult.currentValue}
          >
            Update
          </Button>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{unit}{keyResult.startValue}</span>
          <span>{unit}{keyResult.targetValue}</span>
        </div>
        <Slider
          value={[progressValue]}
          min={keyResult.startValue}
          max={keyResult.targetValue}
          step={keyResult.measurementType === 'percentage' ? 5 : 1}
          onValueChange={handleSliderChange}
          disabled={isPending}
          className="mt-2"
        />
      </div>
    </div>
  );
};
