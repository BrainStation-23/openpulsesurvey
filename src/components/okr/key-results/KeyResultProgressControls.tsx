
import React, { useState, useEffect } from 'react';
import { KeyResult } from '@/types/okr';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [canUpdate, setCanUpdate] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Update local state when prop changes (e.g. after a successful update)
  useEffect(() => {
    setProgressValue(keyResult.currentValue);
  }, [keyResult.currentValue]);

  // Check if the current user is the owner of this key result
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setCanUpdate(false);
          return;
        }
        
        // Check if user is the owner of the key result
        setCanUpdate(user.id === keyResult.ownerId);
      } catch (error) {
        console.error('Error checking permissions:', error);
        setCanUpdate(false);
      }
    };
    
    checkPermissions();
  }, [keyResult.ownerId]);

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
    if (!canUpdate) {
      toast({
        title: "Permission Denied",
        description: "You can only update key results you own",
        variant: "destructive"
      });
      return;
    }
    
    if (progressValue !== keyResult.currentValue) {
      console.log('Updating key result progress:', {
        id: keyResult.id,
        oldValue: keyResult.currentValue,
        newValue: progressValue
      });
      onProgressUpdate(progressValue);
    }
  };

  if (keyResult.measurementType === 'boolean') {
    return (
      <div className="flex items-center justify-between mb-4 mt-2">
        <span className="text-sm font-medium">Completed</span>
        <Switch 
          checked={keyResult.booleanValue} 
          onCheckedChange={(checked) => {
            if (!canUpdate) {
              toast({
                title: "Permission Denied",
                description: "You can only update key results you own",
                variant: "destructive"
              });
              return;
            }
            
            console.log('Toggling boolean key result:', {
              id: keyResult.id,
              oldValue: keyResult.booleanValue,
              newValue: checked
            });
            onBooleanChange(checked);
          }} 
          disabled={isPending || !canUpdate} 
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
            min={keyResult.startValue} 
            max={keyResult.targetValue} 
            step={keyResult.measurementType === 'percentage' ? 5 : 1} 
            disabled={isPending || !canUpdate} 
            className="w-full text-right" 
          />
          <span className="text-sm w-4">{unit}</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleUpdate} 
            disabled={isPending || progressValue === keyResult.currentValue || !canUpdate}
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
          disabled={isPending || !canUpdate} 
          className="mt-2" 
        />
      </div>
    </div>
  );
};
