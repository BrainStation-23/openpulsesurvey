import React, { useState, useEffect } from 'react';
import { KeyResult, KeyResultStatus } from '@/types/okr';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, User } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useKeyResult } from '@/hooks/okr/useKeyResult';
import { KeyResultStatusBadge } from './KeyResultStatusBadge';
import { KeyResultProgressControls } from './KeyResultProgressControls';
import { KeyResultStatusControls } from './KeyResultStatusControls';
import { KeyResultDialogs } from './KeyResultDialogs';
import { getProgressBarColor, getProgressDisplay } from './utils/progressBarUtils';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface KeyResultItemProps {
  keyResult: KeyResult;
}

export const KeyResultItem: React.FC<KeyResultItemProps> = ({ keyResult }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { userId, isAdmin } = useCurrentUser();
  const isOwner = userId === keyResult.ownerId;
  const canEdit = isOwner || isAdmin;
  
  const {
    updateStatus,
    updateProgress,
    deleteKeyResult,
    isDeleting
  } = useKeyResult(keyResult.id);

  const { data: ownerInfo } = useQuery({
    queryKey: ['user', keyResult.ownerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', keyResult.ownerId)
        .single();
        
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (keyResult.progress === 100 && keyResult.status !== 'completed') {
      console.log('Auto-updating key result status to completed due to 100% progress');
      updateStatus.mutate('completed');
    } else if (keyResult.progress > 0 && keyResult.status === 'not_started') {
      console.log('Auto-updating key result status to in_progress due to progress > 0');
      updateStatus.mutate('in_progress');
    }
  }, [keyResult.progress, keyResult.status]);

  const handleStatusUpdate = (status: KeyResultStatus) => {
    if (!canEdit) return;
    
    if (status === 'completed' && keyResult.measurementType !== 'boolean') {
      console.log('Marking key result as completed and setting current value to target', {
        id: keyResult.id,
        currentValue: keyResult.targetValue
      });
      
      updateProgress.mutate({ currentValue: keyResult.targetValue }, {
        onSuccess: () => {
          updateStatus.mutate(status);
        }
      });
    } else {
      console.log('Updating key result status:', { id: keyResult.id, status });
      updateStatus.mutate(status);
    }
  };

  const handleProgressUpdate = (progressValue: number) => {
    if (keyResult.measurementType === 'boolean' || !canEdit) {
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
    if (!canEdit) return;
    
    console.log('Updating boolean key result:', { 
      id: keyResult.id, 
      objectiveId: keyResult.objectiveId,
      oldValue: keyResult.booleanValue, 
      newValue: checked 
    });
    
    updateProgress.mutate({ booleanValue: checked }, {
      onSuccess: () => {
        if (checked && keyResult.status !== 'completed') {
          updateStatus.mutate('completed');
        }
      }
    });
  };

  const handleDelete = () => {
    if (!canEdit) return;
    
    deleteKeyResult.mutate(undefined, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
      }
    });
  };

  const ownerName = ownerInfo 
    ? `${ownerInfo.first_name || ''} ${ownerInfo.last_name || ''}`.trim() 
    : 'Loading...';

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
            {canEdit && (
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
            )}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="h-3 w-3 mr-1" /> 
            <span>Owner: {ownerName}</span>
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
          isDisabled={!canEdit}
        />

        {canEdit && (
          <KeyResultStatusControls 
            status={keyResult.status}
            progress={keyResult.progress}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
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

      {canEdit && (
        <KeyResultDialogs 
          keyResult={keyResult}
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isEditDialogOpen={isEditDialogOpen}
          setIsEditDialogOpen={setIsEditDialogOpen}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </Card>
  );
};
