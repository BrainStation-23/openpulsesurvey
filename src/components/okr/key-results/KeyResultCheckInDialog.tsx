
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

interface KeyResultCheckInDialogProps {
  keyResult: KeyResult;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: UpdateKeyResultInput, id: string) => void;
}

export const KeyResultCheckInDialog = ({ keyResult, open, onOpenChange, onSave }: KeyResultCheckInDialogProps) => {
  const [currentValue, setCurrentValue] = useState<number>(keyResult.currentValue);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (open) {
      setCurrentValue(keyResult.currentValue);
      setError(null);
    }
  }, [open, keyResult]);
  
  // Calculate progress based on current, start and target values
  const calculateProgress = () => {
    if (keyResult.targetValue === keyResult.startValue) return 0;
    const progress = ((currentValue - keyResult.startValue) / (keyResult.targetValue - keyResult.startValue)) * 100;
    return Math.min(Math.max(0, progress), 100); // Clamp between 0-100
  };
  
  const handleSave = () => {
    // Validate that the progress value will be within database limits (precision 5, scale 2)
    const progress = Math.round(calculateProgress());
    if (progress < 0 || progress > 100) {
      setError("Progress must be between 0 and 100");
      return;
    }
    
    onSave({
      currentValue,
      progress
    }, keyResult.id);
    onOpenChange(false);
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
              min={keyResult.startValue}
              max={keyResult.targetValue}
            />
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground flex justify-between">
              <span>Start: {keyResult.startValue}{keyResult.unit && ` ${keyResult.unit}`}</span>
              <span>Target: {keyResult.targetValue}{keyResult.unit && ` ${keyResult.unit}`}</span>
            </div>
            <Progress 
              value={calculateProgress()} 
              className="h-2" 
            />
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
