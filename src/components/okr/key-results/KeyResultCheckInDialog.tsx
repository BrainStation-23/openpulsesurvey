
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { KeyResult, UpdateKeyResultInput } from '@/types/okr';
import { AlertCircle } from 'lucide-react';
import { calculateProgress } from '@/hooks/okr/utils/keyResultValidation';

interface KeyResultCheckInDialogProps {
  keyResult: KeyResult;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: UpdateKeyResultInput, id: string) => void;
}

export const KeyResultCheckInDialog = ({ keyResult, open, onOpenChange, onSave }: KeyResultCheckInDialogProps) => {
  const [currentValue, setCurrentValue] = useState<number | undefined>(keyResult.currentValue);
  const [booleanValue, setBooleanValue] = useState<boolean>(keyResult.booleanValue || false);
  const [error, setError] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState<number>(0);
  
  // Get the measurement type
  const measurementType = keyResult.measurementType || 'numeric';
  
  useEffect(() => {
    if (open) {
      // Reset state when dialog opens
      setCurrentValue(keyResult.currentValue);
      setBooleanValue(keyResult.booleanValue || false);
      setError(null);
      
      // Calculate initial progress based on measurement type
      if (measurementType === 'boolean') {
        setProgressValue(keyResult.booleanValue ? 100 : 0);
      } else {
        // Calculate initial progress
        const progress = calculateProgress(
          measurementType,
          keyResult.currentValue,
          keyResult.startValue,
          keyResult.targetValue
        );
        setProgressValue(progress);
      }
    }
  }, [open, keyResult, measurementType]);
  
  // Recalculate progress when values change
  useEffect(() => {
    if (measurementType === 'boolean') {
      setProgressValue(booleanValue ? 100 : 0);
    } else if (currentValue !== undefined) {
      const progress = calculateProgress(
        measurementType,
        currentValue,
        keyResult.startValue,
        keyResult.targetValue
      );
      setProgressValue(progress);
    }
  }, [currentValue, booleanValue, keyResult.startValue, keyResult.targetValue, measurementType]);
  
  const handleSave = () => {
    // Clear any previous errors
    setError(null);
    
    try {
      if (measurementType === 'boolean') {
        // For boolean type, just update the boolean value and progress
        onSave({
          booleanValue,
          progress: booleanValue ? 100 : 0
        }, keyResult.id);
      } else {
        // Validate the current value range based on database constraints
        const MAX_NUMERIC_VALUE = 999.99;
        const MIN_NUMERIC_VALUE = -999.99;
        
        if (currentValue === undefined) {
          setError("Current value is required");
          return;
        }
        
        if (currentValue < MIN_NUMERIC_VALUE || currentValue > MAX_NUMERIC_VALUE) {
          setError(`Value must be between ${MIN_NUMERIC_VALUE} and ${MAX_NUMERIC_VALUE}`);
          return;
        }
        
        // Round progress to avoid precision issues
        const progress = Math.round(progressValue);
        
        onSave({
          currentValue,
          progress
        }, keyResult.id);
      }
      
      onOpenChange(false);
    } catch (error: any) {
      setError(error.message || "An error occurred while saving");
    }
  };
  
  // Format number based on key result type
  const formatValue = (value: number | undefined) => {
    if (value === undefined) return '';
    
    if (keyResult.unit) {
      return `${value} ${keyResult.unit}`;
    }
    
    if (measurementType === 'percentage') {
      return `${value}%`;
    }
    
    if (measurementType === 'currency') {
      return `$${value}`;
    }
    
    return value.toString();
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Check-in Progress</DialogTitle>
          <DialogDescription>
            Update the current value for "{keyResult.title}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          
          {measurementType === 'boolean' ? (
            <div className="space-y-2">
              <Label htmlFor="boolean-value">Current Status</Label>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="boolean-value" 
                  checked={booleanValue} 
                  onCheckedChange={(checked) => {
                    setBooleanValue(checked === true);
                    setError(null);
                  }}
                />
                <label 
                  htmlFor="boolean-value" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {booleanValue ? 'Completed (Yes)' : 'Not Completed (No)'}
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="current-value">Current Value</Label>
              <Input
                id="current-value"
                type="number"
                value={currentValue === undefined ? '' : currentValue}
                onChange={(e) => {
                  setCurrentValue(e.target.value === '' ? undefined : Number(e.target.value));
                  setError(null);
                }}
                step="any"
              />
            </div>
          )}
          
          <div className="space-y-1">
            {measurementType !== 'boolean' && (
              <div className="text-sm text-muted-foreground flex justify-between">
                <span>Start: {formatValue(keyResult.startValue)}</span>
                <span>Target: {formatValue(keyResult.targetValue)}</span>
              </div>
            )}
            <Progress 
              value={progressValue} 
              className="h-2" 
            />
            <div className="text-sm text-right mt-1">
              Progress: {Math.round(progressValue)}%
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
