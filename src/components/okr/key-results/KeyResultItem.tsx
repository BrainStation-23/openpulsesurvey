
import React, { useState } from 'react';
import { KeyResult, KeyResultStatus } from '@/types/okr';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Check, AlertTriangle, Clock, PlusCircle, MinusCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
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
  
  const {
    updateStatus,
    updateProgress,
    deleteKeyResult,
    isDeleting
  } = useKeyResult(keyResult.id);

  const handleStatusUpdate = (status: KeyResultStatus) => {
    updateStatus.mutate({ status });
  };

  const handleProgressUpdate = (increment: boolean) => {
    if (keyResult.measurementType === 'boolean') {
      updateProgress.mutate({ booleanValue: !keyResult.booleanValue });
      return;
    }

    const step = keyResult.measurementType === 'percentage' ? 5 : 1;
    const newValue = increment 
      ? keyResult.currentValue + step 
      : Math.max(keyResult.startValue, keyResult.currentValue - step);
    
    updateProgress.mutate({ currentValue: newValue });
  };

  const handleDelete = () => {
    deleteKeyResult.mutate(undefined, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
      }
    });
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
          <CardTitle className="text-lg">{keyResult.title}</CardTitle>
          <KeyResultStatusBadge status={keyResult.status} />
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

        <div className="flex flex-wrap gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleProgressUpdate(false)}
            disabled={updateProgress.isPending}
          >
            <MinusCircle className="h-4 w-4 mr-1" />
            Decrease
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleProgressUpdate(true)}
            disabled={updateProgress.isPending}
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Increase
          </Button>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Update Status</h4>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={keyResult.status === 'not_started' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handleStatusUpdate('not_started')}
            >
              <Clock className="h-4 w-4 mr-1" />
              Not Started
            </Button>
            <Button 
              variant={keyResult.status === 'in_progress' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handleStatusUpdate('in_progress')}
            >
              In Progress
            </Button>
            <Button 
              variant={keyResult.status === 'at_risk' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handleStatusUpdate('at_risk')}
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              At Risk
            </Button>
            <Button 
              variant={keyResult.status === 'on_track' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handleStatusUpdate('on_track')}
            >
              On Track
            </Button>
            <Button 
              variant={keyResult.status === 'completed' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handleStatusUpdate('completed')}
            >
              <Check className="h-4 w-4 mr-1" />
              Completed
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 justify-between">
        <div className="text-xs text-muted-foreground">
          Weight: {keyResult.weight.toFixed(1)}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Delete
          </Button>
        </div>
      </CardFooter>

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
