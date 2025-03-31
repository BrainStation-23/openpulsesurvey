
import React, { useState } from 'react';
import { KeyResult } from '@/types/okr';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { KeyResultItem } from './KeyResultItem';
import { KeyResultInlineForm } from './KeyResultInlineForm';
import { useKeyResults } from '@/hooks/okr/useKeyResults';
import { useCurrentUser } from '@/hooks/useCurrentUser';

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
  
  const keyResults = propKeyResults || fetchedKeyResults || [];
  const isLoading = propIsLoading || isResultsLoading;
  // If canEdit prop is provided, use it, otherwise determine based on user permissions
  const canEdit = propCanEdit !== undefined ? propCanEdit : isAdmin;
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

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

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading key results...</div>;
  }

  return (
    <div className="space-y-4">
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
          {canEdit && (
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
                  canEdit={canEdit}
                  onEditClick={() => handleEditClick(keyResult.id)}
                />
              )}
            </React.Fragment>
          ))}
          
          {canEdit && !isAddingNew && !editingId && (
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
