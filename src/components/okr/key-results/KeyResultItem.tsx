
import React, { useState, useEffect } from 'react';
import { KeyResult, KeyResultStatus } from '@/types/okr';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, AlertTriangle, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useKeyResult } from '@/hooks/okr/useKeyResult';
import { KeyResultForm } from './KeyResultForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface KeyResultItemProps {
  keyResult: KeyResult;
}

export const KeyResultStatusBadge = ({ status }: { status: KeyResultStatus }) => {
  switch (status) {
    case 'not_started':
      return <Badge variant="outline" className="bg-slate-100">Not Started</Badge>;
    case 'in_progress':
      return <Badge variant="outline" className="bg-blue-100 text-blue-800">In Progress</Badge>;
    case 'at_risk':
      return <Badge variant="outline" className="bg-red-100 text-red-800">At Risk</Badge>;
    case 'on_track':
      return <Badge variant="outline" className="bg-green-100 text-green-800">On Track</Badge>;
    case 'completed':
      return <Badge variant="outline" className="bg-purple-100 text-purple-800">Completed</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

export const KeyResultItem: React.FC<KeyResultItemProps> = ({ keyResult }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [progressValue, setProgressValue] = useState<number>(keyResult.currentValue);
  
  const {
    updateStatus,
    updateProgress,
    deleteKeyResult,
    isDeleting
  } = useKeyResult(keyResult.id);

  // Effect to handle automatic status updates based on progress
  useEffect(() => {
    if (keyResult.progress === 100 && keyResult.status !== 'completed') {
      updateStatus.mutate({ status: 'completed' });
    } else if (keyResult.progress > 0 && keyResult.status === 'not_started') {
      updateStatus.mutate({ status: 'in_progress' });
    }
  }, [keyResult.progress, keyResult.status]);

  const handleStatusUpdate = (status: KeyResultStatus) => {
    updateStatus.mutate({ status });
  };

  const handleProgressUpdate = () => {
    if (keyResult.measurementType === 'boolean') {
      return;
    }

    if (progressValue !== keyResult.currentValue) {
      updateProgress.mutate({ currentValue: progressValue });
    }
  };

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

  const handleBooleanChange = (checked: boolean) => {
    updateProgress.mutate({ booleanValue: checked });
  };

  const handleDelete = () => {
    deleteKeyResult.mutate(undefined, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
      }
    });
  };

  const renderProgressControls = () => {
    if (keyResult.measurementType === 'boolean') {
      return (
        <div className="flex items-center justify-between mb-4 mt-2">
          <span className="text-sm font-medium">Completed</span>
          <Switch 
            checked={keyResult.booleanValue} 
            onCheckedChange={handleBooleanChange}
            disabled={updateProgress.isPending}
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
      unit = keyResult.unit;
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
              disabled={updateProgress.isPending}
            />
            <span className="text-sm w-4">{unit}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleProgressUpdate}
              disabled={updateProgress.isPending || progressValue === keyResult.currentValue}
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
            disabled={updateProgress.isPending}
            className="mt-2"
          />
        </div>
      </div>
    );
  };

  const getProgressDisplay = () => {
    if (keyResult.measurementType === 'boolean') {
      return keyResult.booleanValue ? 'Completed' : 'Not Completed';
    }

    let unit = '';
    if (keyResult.measurementType === 'percentage') {
      unit = '%';
    } else if (keyResult.measurementType === 'currency') {
      unit = '$';
    } else if (keyResult.unit) {
      unit = keyResult.unit;
    }

    return `${unit}${keyResult.currentValue} / ${unit}${keyResult.targetValue}`;
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-gray-100 text-gray-800">
              Weight: {keyResult.weight.toFixed(1)}
            </Badge>
            <CardTitle className="text-lg ml-2">{keyResult.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit Key Result</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setIsDeleteDialogOpen(true)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete Key Result</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        {keyResult.description && (
          <p className="text-muted-foreground mb-4">{keyResult.description}</p>
        )}
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Progress: {keyResult.progress.toFixed(0)}%</span>
            <span className="text-sm">{getProgressDisplay()}</span>
          </div>
          <Progress value={keyResult.progress} className="h-2" />
        </div>

        {renderProgressControls()}

        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Status: <span className="font-normal">{keyResult.status.replace('_', ' ')}</span></h4>
          <div className="grid grid-cols-2 gap-2">
            {keyResult.status !== 'at_risk' && (
              <Button 
                variant="outline" 
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => handleStatusUpdate('at_risk')}
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Mark At Risk
              </Button>
            )}
            
            {keyResult.status !== 'on_track' && keyResult.progress < 100 && (
              <Button 
                variant="outline" 
                size="sm"
                className="text-green-600 border-green-200 hover:bg-green-50"
                onClick={() => handleStatusUpdate('on_track')}
              >
                On Track
              </Button>
            )}
            
            {keyResult.status !== 'completed' && (
              <Button 
                variant="outline" 
                size="sm"
                className="text-purple-600 border-purple-200 hover:bg-purple-50"
                onClick={() => handleStatusUpdate('completed')}
              >
                <Check className="h-4 w-4 mr-1" />
                Mark Complete
              </Button>
            )}
          </div>
        </div>
      </CardContent>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this key result?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this key result
              and may affect the objective's progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Key Result</DialogTitle>
          </DialogHeader>
          <KeyResultForm
            keyResult={keyResult}
            objectiveId={keyResult.objectiveId}
            onClose={() => setIsEditDialogOpen(false)}
            mode="edit"
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

