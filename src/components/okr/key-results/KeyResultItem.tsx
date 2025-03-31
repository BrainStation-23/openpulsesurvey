
import React, { useState } from 'react';
import { KeyResult } from '@/types/okr';
import { Card } from '@/components/ui/card';
import { useKeyResult } from '@/hooks/okr/useKeyResult';
import { KeyResultHeader } from './components/KeyResultHeader';
import { KeyResultDescription } from './components/KeyResultDescription';
import { KeyResultProgressDisplay } from './components/KeyResultProgressDisplay';
import { KeyResultProgressControls } from './KeyResultProgressControls';
import { KeyResultStatusControls } from './KeyResultStatusControls';
import { KeyResultDialogs } from './KeyResultDialogs';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProgressBarColor } from './utils/progressBarUtils';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface KeyResultItemProps {
  keyResult: KeyResult;
  canEdit: boolean;
  onEditClick: () => void;
}

export const KeyResultItem: React.FC<KeyResultItemProps> = ({ keyResult, canEdit, onEditClick }) => {
  const { userId } = useCurrentUser();
  const { deleteKeyResult, updateProgress, updateStatus } = useKeyResult(keyResult.id);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  
  // Determine if the current user can manage this key result
  const isOwner = keyResult.ownerId === userId;
  const canManage = canEdit || isOwner;
  
  const handleDelete = () => {
    deleteKeyResult.mutate(undefined, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
      }
    });
  };

  const handleProgressUpdate = (value: number) => {
    updateProgress.mutate({ currentValue: value });
  };

  const handleBooleanChange = (checked: boolean) => {
    updateProgress.mutate({ booleanValue: checked });
  };

  const handleStatusUpdate = (status: KeyResult['status']) => {
    updateStatus.mutate(status);
  };

  return (
    <>
      <Card className="overflow-hidden border-l-4" style={{ borderLeftColor: getProgressBarColor(keyResult.progress, keyResult.status) }}>
        <KeyResultHeader
          keyResult={keyResult}
          canEdit={canManage}
          onEditClick={onEditClick}
          onDeleteClick={() => setIsDeleteDialogOpen(true)}
        />
        
        <div className="px-6 pb-3">
          <Progress 
            value={keyResult.progress} 
            className="h-3 mt-2"
            indicatorClassName={getProgressBarColor(keyResult.progress, keyResult.status)}
          />
          
          <KeyResultProgressDisplay keyResult={keyResult} />
          
          {keyResult.description && (
            <Collapsible>
              <div className="flex items-center justify-between mt-2">
                <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-7 w-7">
                    <ChevronDown className="h-4 w-4" />
                    <span className="sr-only">Toggle description</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <KeyResultDescription description={keyResult.description} />
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
        
        {canManage && (
          <div className="border-t bg-muted/30 px-6 py-3 space-y-3">
            <Collapsible open={isProgressOpen} onOpenChange={setIsProgressOpen}>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Update Progress</h4>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7">
                    {isProgressOpen ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                    {isProgressOpen ? "Hide" : "Show"}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="pt-3">
                <KeyResultProgressControls 
                  keyResult={keyResult} 
                  onProgressUpdate={handleProgressUpdate}
                  onBooleanChange={handleBooleanChange}
                  isPending={updateProgress.isPending}
                />
              </CollapsibleContent>
            </Collapsible>
            
            <Collapsible open={isStatusOpen} onOpenChange={setIsStatusOpen}>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Update Status</h4>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7">
                    {isStatusOpen ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                    {isStatusOpen ? "Hide" : "Show"}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="pt-3">
                <KeyResultStatusControls 
                  status={keyResult.status}
                  progress={keyResult.progress}
                  onStatusUpdate={handleStatusUpdate}
                />
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </Card>

      <KeyResultDialogs
        keyResult={keyResult}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        onDelete={handleDelete}
        isDeleting={deleteKeyResult.isPending}
      />
    </>
  );
};
