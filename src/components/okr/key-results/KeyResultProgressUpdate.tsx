
import React, { useState } from 'react';
import { KeyResult } from '@/types/okr';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Check, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useKeyResult } from '@/hooks/okr/useKeyResult';

interface KeyResultProgressUpdateProps {
  keyResult: KeyResult;
  onProgressUpdate?: () => void;
}

export const KeyResultProgressUpdate: React.FC<KeyResultProgressUpdateProps> = ({
  keyResult,
  onProgressUpdate
}) => {
  const { toast } = useToast();
  const { updateProgress } = useKeyResult(keyResult.id);
  
  // State for numeric inputs
  const [currentValue, setCurrentValue] = useState<number>(keyResult.currentValue);
  
  // State for boolean inputs
  const [booleanValue, setBooleanValue] = useState<boolean>(keyResult.booleanValue || false);
  
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate progress percentage
  const calculateProgress = (value: number): number => {
    if (keyResult.targetValue === keyResult.startValue) {
      return value >= keyResult.targetValue ? 100 : 0;
    }
    
    const progress = ((value - keyResult.startValue) / 
                     (keyResult.targetValue - keyResult.startValue)) * 100;
    
    return Math.min(Math.max(0, Math.round(progress)), 100);
  };

  // Format the display value with appropriate unit
  const formatValue = (value: number): string => {
    if (keyResult.measurementType === 'percentage') {
      return `${value}%`;
    } else if (keyResult.measurementType === 'currency') {
      return `$${value}`;
    } else {
      return `${value}${keyResult.unit ? ' ' + keyResult.unit : ''}`;
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // Update based on measurement type
      if (keyResult.measurementType === 'boolean') {
        await updateProgress.mutateAsync({ booleanValue });
      } else {
        await updateProgress.mutateAsync({ currentValue });
      }
      
      toast({
        title: "Progress updated",
        description: "Key result progress has been successfully updated."
      });
      
      if (onProgressUpdate) {
        onProgressUpdate();
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update progress. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (keyResult.measurementType === 'boolean') {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="boolean-value"
            checked={booleanValue}
            onCheckedChange={setBooleanValue}
          />
          <Label htmlFor="boolean-value">
            {booleanValue ? (
              <span className="flex items-center text-green-600">
                <Check className="mr-1 h-4 w-4" /> Completed
              </span>
            ) : (
              <span className="flex items-center text-gray-500">
                <X className="mr-1 h-4 w-4" /> Not Completed
              </span>
            )}
          </Label>
        </div>
        
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSubmitting || booleanValue === keyResult.booleanValue}
          >
            {isSubmitting ? "Saving..." : "Save Progress"}
          </Button>
        </div>
      </div>
    );
  }

  // For numeric measurement types
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Start: {formatValue(keyResult.startValue)}</span>
          <span>Target: {formatValue(keyResult.targetValue)}</span>
        </div>
        
        <Slider
          value={[currentValue]}
          min={Math.min(keyResult.startValue, keyResult.targetValue)}
          max={Math.max(keyResult.startValue, keyResult.targetValue)}
          step={(Math.abs(keyResult.targetValue - keyResult.startValue) <= 10) ? 0.1 : 1}
          onValueChange={(values) => setCurrentValue(values[0])}
        />
        
        <div className="flex items-center space-x-2 pt-2">
          <div className="flex-1">
            <Input
              type="number"
              value={currentValue}
              onChange={(e) => setCurrentValue(Number(e.target.value))}
              step={(Math.abs(keyResult.targetValue - keyResult.startValue) <= 10) ? 0.1 : 1}
            />
          </div>
          <div className="w-20 text-right">
            <span className="text-sm font-medium">
              {calculateProgress(currentValue)}%
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSubmitting || currentValue === keyResult.currentValue}
        >
          {isSubmitting ? "Saving..." : "Save Progress"}
        </Button>
      </div>
    </div>
  );
};
