
import React, { useState } from 'react';
import { useKeyResults } from '@/hooks/okr/useKeyResults';
import { KeyResultsLoading } from './KeyResultsLoading';
import { EmptyKeyResults } from './EmptyKeyResults';
import { KeyResultCard } from './KeyResultCard';
import { KeyResult } from '@/types/okr';
import { KeyResultDialogs } from './KeyResultDialogs';
import { AlertCircle } from 'lucide-react';

interface KeyResultsListProps {
  objectiveId: string;
}

export const KeyResultsList = ({ objectiveId }: KeyResultsListProps) => {
  const { keyResults, isLoading, error, updateKeyResult, deleteKeyResult } = useKeyResults(objectiveId);
  const [selectedKeyResult, setSelectedKeyResult] = useState<KeyResult | null>(null);
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  if (isLoading) {
    return <KeyResultsLoading />;
  }
  
  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 border border-destructive/20 mt-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <h3 className="font-medium text-destructive">Error loading key results</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
      </div>
    );
  }
  
  if (!keyResults || keyResults.length === 0) {
    return <EmptyKeyResults objectiveId={objectiveId} />;
  }
  
  const handleCheckIn = (keyResult: KeyResult) => {
    setSelectedKeyResult(keyResult);
    setIsCheckInDialogOpen(true);
  };
  
  const handleEdit = (keyResult: KeyResult) => {
    setSelectedKeyResult(keyResult);
    setIsEditDialogOpen(true);
  };
  
  const handleDelete = (keyResult: KeyResult) => {
    setSelectedKeyResult(keyResult);
    setIsDeleteDialogOpen(true);
  };
  
  const handleSaveCheckIn = (data: any, id: string) => {
    updateKeyResult.mutate({ id, ...data });
  };
  
  const handleSaveEdit = (data: any, id: string) => {
    updateKeyResult.mutate({ id, ...data });
  };
  
  const handleConfirmDelete = () => {
    if (selectedKeyResult) {
      deleteKeyResult.mutate(selectedKeyResult.id);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Key Results</h2>
      <div className="space-y-4">
        {keyResults.map((keyResult) => (
          <KeyResultCard 
            key={keyResult.id} 
            keyResult={keyResult} 
            onCheckIn={handleCheckIn}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
      
      <KeyResultDialogs
        selectedKeyResult={selectedKeyResult}
        isCheckInDialogOpen={isCheckInDialogOpen}
        setIsCheckInDialogOpen={setIsCheckInDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        onSaveCheckIn={handleSaveCheckIn}
        onSaveEdit={handleSaveEdit}
        onDelete={handleConfirmDelete}
        isDeleting={deleteKeyResult.isPending}
      />
    </div>
  );
};
