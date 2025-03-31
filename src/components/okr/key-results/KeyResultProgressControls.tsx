
import React, { useState, useEffect } from 'react';
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
  isDisabled?: boolean;
}

export const KeyResultProgressControls: React.FC<KeyResultProgressControlsProps> = ({
  keyResult,
  onProgressUpdate,
  onBooleanChange,
  isPending,
  isDisabled = false
}) => {
  const [progressValue, setProgressValue] = useState<number>(keyResult.currentValue);
  
  // Update local state when prop changes (e.g. after a successful update)
  useEffect(() => {
    setProgressValue(keyResult.currentValue);
  }, [keyResult.currentValue]);

  const handleSliderChange = (value: number[]) => {
    setProgressValue(value[0]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      const bounded = Math.max(keyResult.startValue, Math.min(keyResult.targetValue, value));
      setProgressValue(bounded);
    }
  };

  const handleUpdate = () => {
    if (progressValue !== keyResult.currentValue && !isDisabled) {
      onProgressUpdate(progressValue);
    }
  };

  if (keyResult.measurementType === 'boolean') {
    return (
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm">Completed</span>
        <Switch 
          checked={keyResult.booleanValue} 
          onCheckedChange={onBooleanChange} 
          disabled={isPending || isDisabled} 
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
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm">Current Value:</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <Input 
              type="number" 
              value={progressValue} 
              onChange={handleInputChange} 
              min={keyResult.startValue} 
              max={keyResult.targetValue} 
              step={keyResult.measurementType === 'percentage' ? 5 : 1} 
              disabled={isPending || isDisabled} 
              className="w-20 text-right" 
            />
            <span className="text-sm ml-1 w-4">{unit}</span>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleUpdate} 
            disabled={isPending || isDisabled || progressValue === keyResult.currentValue}
          >
            Update
          </Button>
        </div>
      </div>
      
      <div className="space-y-1">
        <Slider 
          value={[progressValue]} 
          min={keyResult.startValue} 
          max={keyResult.targetValue} 
          step={keyResult.measurementType === 'percentage' ? 5 : 1} 
          onValueChange={handleSliderChange} 
          disabled={isPending || isDisabled} 
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{unit}{keyResult.startValue}</span>
          <span>{unit}{keyResult.targetValue}</span>
        </div>
      </div>
    </div>
  );
};
