
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
  const [currentValue, setCurrentValue] = useState<number>(keyResult.currentValue);
  const [error, setError] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState<number>(0);
  
  useEffect(() => {
    if (open) {
      setCurrentValue(keyResult.currentValue);
      setError(null);
      
      // Calculate initial progress
      const progress = calculateProgress(
        keyResult.currentValue,
        keyResult.startValue,
        keyResult.targetValue
      );
      setProgressValue(progress);
    }
  }, [open, keyResult]);
  
  // Recalculate progress when currentValue changes
  useEffect(() => {
    const progress = calculateProgress(
      currentValue,
      keyResult.startValue,
      keyResult.targetValue
    );
    setProgressValue(progress);
  }, [currentValue, keyResult.startValue, keyResult.targetValue]);
  
  const handleSave = () => {
    // Clear any previous errors
    setError(null);
    
    try {
      // Validate the current value range based on database constraints
      const MAX_NUMERIC_VALUE = 999.99;
      const MIN_NUMERIC_VALUE = -999.99;
      
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
      
      onOpenChange(false);
    } catch (error: any) {
      setError(error.message || "An error occurred while saving");
    }
  };
  
  // Format number based on key result type
  const formatValue = (value: number) => {
    if (keyResult.unit) {
      return `${value} ${keyResult.unit}`;
    }
    
    if (keyResult.krType === 'percentage') {
      return `${value}%`;
    }
    
    if (keyResult.krType === 'currency') {
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
          
          <div className="space-y-2">
            <Label htmlFor="current-value">Current Value</Label>
            <Input
              id="current-value"
              type="number"
              value={currentValue}
              onChange={(e) => {
                setCurrentValue(Number(e.target.value));
                setError(null);
              }}
              step="any"
            />
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground flex justify-between">
              <span>Start: {formatValue(keyResult.startValue)}</span>
              <span>Target: {formatValue(keyResult.targetValue)}</span>
            </div>
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
