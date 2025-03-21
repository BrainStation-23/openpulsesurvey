
import React, { useState, useEffect } from 'react';
import { KeyResult, KeyResultStatus } from '@/types/okr';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useKeyResult } from '@/hooks/okr/useKeyResult';
import { KeyResultStatusBadge } from './KeyResultStatusBadge';
import { KeyResultProgressControls } from './KeyResultProgressControls';
import { KeyResultStatusControls } from './KeyResultStatusControls';
import { KeyResultDialogs } from './KeyResultDialogs';
import { getProgressBarColor, getProgressDisplay } from './utils/progressBarUtils';

interface KeyResultItemProps {
  keyResult: KeyResult;
}

export const KeyResultItem: React.FC<KeyResultItemProps> = ({ keyResult }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const {
    updateStatus,
    updateProgress,
    deleteKeyResult,
    isDeleting
  } = useKeyResult(keyResult.id);

  // Effect to handle automatic status updates based on progress
  useEffect(() => {
    if (keyResult.progress === 100 && keyResult.status !== 'completed') {
      console.log('Auto-updating key result status to completed due to 100% progress');
      updateStatus.mutate({ status: 'completed' });
    } else if (keyResult.progress > 0 && keyResult.status === 'not_started') {
      console.log('Auto-updating key result status to in_progress due to progress > 0');
      updateStatus.mutate({ status: 'in_progress' });
    }
  }, [keyResult.progress, keyResult.status]);

  const handleStatusUpdate = (status: KeyResultStatus) => {
    console.log('Updating key result status:', { id: keyResult.id, status });
    updateStatus.mutate({ status });
  };

  const handleProgressUpdate = (progressValue: number) => {
    if (keyResult.measurementType === 'boolean') {
      return;
    }

    if (progressValue !== keyResult.currentValue) {
      console.log('Updating key result progress:', { 
        id: keyResult.id, 
        objectiveId: keyResult.objectiveId,
        oldValue: keyResult.currentValue, 
        newValue: progressValue 
      });
      updateProgress.mutate({ currentValue: progressValue });
    }
  };

  const handleBooleanChange = (checked: boolean) => {
    console.log('Updating boolean key result:', { 
      id: keyResult.id, 
      objectiveId: keyResult.objectiveId,
      oldValue: keyResult.booleanValue, 
      newValue: checked 
    });
    updateProgress.mutate({ booleanValue: checked });
  };

  const handleDelete = () => {
    deleteKeyResult.mutate(undefined, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
      }
    });
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{keyResult.title}</CardTitle>
              <KeyResultStatusBadge status={keyResult.status} />
              <Badge variant="outline" className="bg-gray-100 text-gray-800">
                Weight: {keyResult.weight.toFixed(1)}
              </Badge>
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
          <Separator className="my-1" />
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        {keyResult.description && (
          <p className="text-muted-foreground mb-4">{keyResult.description}</p>
        )}
        
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

        <KeyResultProgressControls 
          keyResult={keyResult}
          onProgressUpdate={handleProgressUpdate}
          onBooleanChange={handleBooleanChange}
          isPending={updateProgress.isPending}
        />

        <KeyResultStatusControls 
          status={keyResult.status}
          progress={keyResult.progress}
          onStatusUpdate={handleStatusUpdate}
        />
      </CardContent>
      
      <CardFooter className="pt-0 pb-3 px-6">
        <div className="w-full">
          <Progress 
            value={keyResult.progress} 
            className="h-4 rounded-md" 
            indicatorClassName={getProgressBarColor(keyResult.progress, keyResult.status)}
          />
        </div>
      </CardFooter>

      <KeyResultDialogs 
        keyResult={keyResult}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </Card>
  );
};
