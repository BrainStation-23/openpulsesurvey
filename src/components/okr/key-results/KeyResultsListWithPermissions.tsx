
import React, { useState } from 'react';
import { KeyResultsList } from './KeyResultsList';
import { useOkrPermissions } from '@/hooks/okr/useOkrPermissions';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { KeyResultForm } from './KeyResultForm';
import { Card, CardContent } from '@/components/ui/card';
import { useObjective } from '@/hooks/okr/useObjective';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface KeyResultsListWithPermissionsProps {
  objectiveId: string;
}

export const KeyResultsListWithPermissions: React.FC<KeyResultsListWithPermissionsProps> = ({ 
  objectiveId 
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { objective } = useObjective(objectiveId);
  const { 
    canCreateKeyResults, 
    isObjectiveOwner,
    isLoading 
  } = useOkrPermissions();
  const [isOwner, setIsOwner] = useState(false);

  // Check if the current user is the owner of this objective
  React.useEffect(() => {
    const checkOwnership = async () => {
      if (objectiveId) {
        const result = await isObjectiveOwner(objectiveId);
        setIsOwner(result);
      }
    };
    
    checkOwnership();
  }, [objectiveId, isObjectiveOwner]);

  // Determine if the user can add key results
  const canAddKeyResults = canCreateKeyResults || isOwner;

  // Handle form close with success/failure
  const handleFormClose = (success?: boolean) => {
    setIsAddDialogOpen(false);
  };

  if (isLoading) {
    return <KeyResultsList objectiveId={objectiveId} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Key Results</h3>
        {canAddKeyResults ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAddDialogOpen(true)}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Key Result
          </Button>
        ) : null}
      </div>

      {!canAddKeyResults && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Permission Note</AlertTitle>
          <AlertDescription>
            You don't have permission to add key results to this objective.
            Only the objective owner and users with specific permissions can add key results.
          </AlertDescription>
        </Alert>
      )}
      
      <KeyResultsList objectiveId={objectiveId} />

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Key Result</DialogTitle>
          </DialogHeader>
          <KeyResultForm
            objectiveId={objectiveId}
            onClose={handleFormClose}
            mode="create"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
