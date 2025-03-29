
import React, { useState } from 'react';
import { KeyResult } from '@/types/okr';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { KeyResultProgressUpdate } from './KeyResultProgressUpdate';
import { KeyResultProgressDisplay } from './components/KeyResultProgressDisplay';
import { Edit, Trash2, Target, Zap, Calendar, BarChart, RotateCcw } from 'lucide-react';
import { useKeyResult } from '@/hooks/okr/useKeyResult';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useTheme } from '@/hooks/useTheme';
import { KeyResultForm } from './KeyResultForm';
import { useObjective } from '@/hooks/okr/useObjective';

interface KeyResultItemProps {
  keyResult: KeyResult;
  onDelete?: () => void;
}

export const KeyResultItem: React.FC<KeyResultItemProps> = ({ keyResult, onDelete }) => {
  const { userId, isAdmin } = useCurrentUser();
  const { theme } = useTheme();
  
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { objective } = useObjective(keyResult.objectiveId);
  const { updateStatus, deleteKeyResult, isDeleting } = useKeyResult(keyResult.id);

  const isOwner = objective && userId === objective.ownerId;
  const canEdit = isAdmin || isOwner || (objective?.visibility === 'organization' || objective?.visibility === 'team');
  const isDarkTheme = theme === 'dark';

  const handleDelete = async () => {
    if (!canEdit) return;

    try {
      await deleteKeyResult.mutateAsync();
      setIsDeleteDialogOpen(false);
      if (onDelete) onDelete();
    } catch (error) {
      console.error('Error deleting key result:', error);
    }
  };

  const handleStatusUpdate = async (status: 'on_track' | 'at_risk' | 'completed') => {
    if (!canEdit) return;
    
    try {
      await updateStatus.mutateAsync(status);
    } catch (error) {
      console.error('Error updating key result status:', error);
    }
  };

  // Format weight as percentage 
  const weightFormatted = `${(keyResult.weight * 100).toFixed(0)}%`;
  
  // Calculate progress percentage based on measurement type and values
  const getProgressPercentage = (): number => {
    if (keyResult.measurementType === 'boolean') {
      return keyResult.booleanValue ? 100 : 0;
    }
    
    if (keyResult.targetValue === keyResult.startValue) {
      return keyResult.currentValue >= keyResult.targetValue ? 100 : 0;
    }
    
    const progress = ((keyResult.currentValue - keyResult.startValue) / 
                     (keyResult.targetValue - keyResult.startValue)) * 100;
    
    return Math.min(Math.max(0, progress), 100);
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">{keyResult.title}</CardTitle>
            <CardDescription>{keyResult.description}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant="outline"
              className={
                keyResult.krType === 'committed' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 
                keyResult.krType === 'aspirational' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300' : 
                'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }
            >
              {keyResult.krType.charAt(0).toUpperCase() + keyResult.krType.slice(1)}
            </Badge>
            <Badge
              variant={keyResult.status === 'completed' ? 'success' : 'outline'}
              className={
                keyResult.status === 'at_risk' ? 'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300' : 
                keyResult.status === 'completed' ? '' : 
                'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              }
            >
              {keyResult.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1 text-sm">
            <span className="font-medium">Progress: {Math.round(getProgressPercentage())}%</span>
            <span className="font-medium">Weight: {weightFormatted}</span>
          </div>
          <Progress 
            value={getProgressPercentage()} 
            className={`h-2 ${
              keyResult.status === 'at_risk' ? 'bg-red-100 dark:bg-red-950' : 
              keyResult.status === 'completed' ? 'bg-green-100 dark:bg-green-950' : 
              'bg-blue-100 dark:bg-blue-950'
            }`}
            indicatorClassName={`${
              keyResult.status === 'at_risk' ? 'bg-red-500' : 
              keyResult.status === 'completed' ? 'bg-green-500' : 
              'bg-blue-500'
            }`}
          />
        </div>

        <KeyResultProgressDisplay keyResult={keyResult} />
        
        <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Target className="w-3.5 h-3.5 mr-1" />
            <span>{keyResult.measurementType.charAt(0).toUpperCase() + keyResult.measurementType.slice(1)}</span>
          </div>
          
          {keyResult.dueDate && (
            <div className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              <span>Due: {new Date(keyResult.dueDate).toLocaleDateString()}</span>
            </div>
          )}
          
          <div className="flex items-center">
            <BarChart className="w-3.5 h-3.5 mr-1" />
            <span>Weight: {weightFormatted}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex justify-end">
        {canEdit && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsUpdateDialogOpen(true)}
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Update Progress
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </CardFooter>
      
      {/* Progress Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Key Result Progress</DialogTitle>
          </DialogHeader>
          <KeyResultProgressUpdate 
            keyResult={keyResult} 
            onProgressUpdate={() => setIsUpdateDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Key Result</DialogTitle>
          </DialogHeader>
          <KeyResultForm
            objectiveId={keyResult.objectiveId}
            keyResult={keyResult}
            onClose={(success) => {
              setIsEditDialogOpen(false);
              if (success && onDelete) onDelete();
            }}
            mode="edit"
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the key result
              and remove it from the objective.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
