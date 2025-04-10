
import React, { useState, useEffect } from 'react';
import { KeyResult } from '@/types/okr';
import { Button } from '@/components/ui/button';
import { Plus, AlertCircle } from 'lucide-react';
import { KeyResultItem } from './KeyResultItem';
import { KeyResultInlineForm } from './KeyResultInlineForm';
import { useKeyResults } from '@/hooks/okr/useKeyResults';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { supabase } from '@/integrations/supabase/client';
import { useObjectiveAccessPermission } from '@/hooks/okr/useObjectiveAccessPermission';
import { useObjectiveConstraints } from '@/hooks/okr/useObjectiveConstraints';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface KeyResultsListProps {
  objectiveId: string;
  canEdit?: boolean;
  isLoading?: boolean;
  keyResults?: KeyResult[];
}

export const KeyResultsList: React.FC<KeyResultsListProps> = ({
  objectiveId,
  canEdit: propCanEdit,
  isLoading: propIsLoading,
  keyResults: propKeyResults
}) => {
  const { userId, isAdmin } = useCurrentUser();
  const { data: fetchedKeyResults, isLoading: isResultsLoading } = useKeyResults(objectiveId);
  const [canCreateKeyResults, setCanCreateKeyResults] = useState(false);
  const { canEdit: hasEditPermission } = useObjectiveAccessPermission({ 
    userId,
    objectiveId
  });
  
  // Check objective constraints
  const { 
    hasChildAlignments, 
    canCreateKeyResults: canCreateDueToConstraints,
    isLoading: isLoadingConstraints 
  } = useObjectiveConstraints(objectiveId);
  
  const keyResults = propKeyResults || fetchedKeyResults || [];
  const isLoading = propIsLoading || isResultsLoading || isLoadingConstraints;
  
  // If canEdit prop is provided, use it for general editing
  // Otherwise, check if user is admin OR has explicit edit permission
  const canEdit = propCanEdit !== undefined 
    ? propCanEdit 
    : (isAdmin || hasEditPermission || false);
  
  // canCreateKeyResults is now separate from canEdit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Check if the user can create key results using the database function
  useEffect(() => {
    const checkKeyResultPermission = async () => {
      if (!userId) return;
      
      console.log('Checking key result permission for user:', userId);
      
      const { data, error } = await supabase.rpc('can_create_key_result', {
        p_user_id: userId
      });
      
      if (error) {
        console.error('Error checking key result permission:', error);
        return;
      }
      
      console.log('Permission check result:', data);
      setCanCreateKeyResults(!!data);
    };
    
    checkKeyResultPermission();
  }, [userId]);
  
  const handleEditClick = (keyResultId: string) => {
    if (isAddingNew) setIsAddingNew(false);
    setEditingId(keyResultId);
  };

  const handleAddNewClick = () => {
    if (editingId) setEditingId(null);
    setIsAddingNew(true);
  };

  const handleCloseForm = () => {
    setEditingId(null);
    setIsAddingNew(false);
  };

  const editingKeyResult = editingId 
    ? keyResults.find(kr => kr.id === editingId)
    : undefined;

  // Determine if key results can be created based on both permissions and constraints
  const canCreateKeyResultsFinal = canCreateKeyResults && canCreateDueToConstraints;

  // Debug logging
  console.log('KeyResultsList permissions:', {
    userId,
    isAdmin,
    canCreateKeyResults,
    canCreateDueToConstraints,
    canCreateKeyResultsFinal,
    canEdit,
    propCanEdit,
    hasEditPermission,
    hasChildAlignments
  });

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading key results...</div>;
  }

  return (
    <div className="space-y-4">
      {hasChildAlignments && (
        <Alert variant="warning" className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription>
            This objective has child alignments, so you cannot add key results to it.
          </AlertDescription>
        </Alert>
      )}
      
      {isAddingNew && (
        <KeyResultInlineForm
          objectiveId={objectiveId}
          onClose={handleCloseForm}
          mode="create"
        />
      )}
      
      {keyResults.length === 0 && !isAddingNew ? (
        <div className="py-8 text-center text-muted-foreground">
          No key results defined yet.
          {(canEdit || canCreateKeyResultsFinal) && !hasChildAlignments && (
            <div className="mt-2">
              <Button onClick={handleAddNewClick}>
                <Plus className="h-4 w-4 mr-1" /> Add Key Result
              </Button>
            </div>
          )}
        </div>
      ) : (
        <>
          {keyResults.map((keyResult) => (
            <React.Fragment key={keyResult.id}>
              {editingId === keyResult.id ? (
                <KeyResultInlineForm
                  objectiveId={objectiveId}
                  keyResult={editingKeyResult}
                  onClose={handleCloseForm}
                  mode="edit"
                />
              ) : (
                <KeyResultItem
                  keyResult={keyResult}
                  canEdit={canEdit || (userId === keyResult.ownerId)}
                  onEditClick={() => handleEditClick(keyResult.id)}
                />
              )}
            </React.Fragment>
          ))}
          
          {(canEdit || canCreateKeyResultsFinal) && !isAddingNew && !editingId && !hasChildAlignments && (
            <div className="mt-4">
              <Button onClick={handleAddNewClick}>
                <Plus className="h-4 w-4 mr-1" /> Add Key Result
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
