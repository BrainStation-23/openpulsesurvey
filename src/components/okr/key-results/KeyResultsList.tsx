
import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { useKeyResults } from '@/hooks/okr/useKeyResults';
import { useToast } from '@/hooks/use-toast';
import { KeyResult, UpdateKeyResultInput } from '@/types/okr';
import { KeyResultCard } from './KeyResultCard';
import { KeyResultsLoading } from './KeyResultsLoading';
import { EmptyKeyResults } from './EmptyKeyResults';
import { KeyResultDialogs } from './KeyResultDialogs';

interface KeyResultsListProps {
  objectiveId: string;
}

export const KeyResultsList = ({ objectiveId }: KeyResultsListProps) => {
  const { keyResults, isLoading, updateKeyResult, deleteKeyResult } = useKeyResults(objectiveId);
  const { toast } = useToast();
  const [selectedKeyResult, setSelectedKeyResult] = useState<KeyResult | null>(null);
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleCheckIn = (kr: KeyResult) => {
    setSelectedKeyResult(kr);
    setIsCheckInDialogOpen(true);
  };

  const handleEdit = (kr: KeyResult) => {
    setSelectedKeyResult(kr);
    setIsEditDialogOpen(true);
  };

  const handleDeleteConfirm = (kr: KeyResult) => {
    setSelectedKeyResult(kr);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!selectedKeyResult) return;
    
    deleteKeyResult.mutate(selectedKeyResult.id, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Key result deleted successfully"
        });
        setIsDeleteDialogOpen(false);
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message
        });
      }
    });
  };

  const handleSaveCheckIn = (data: UpdateKeyResultInput, id: string) => {
    updateKeyResult.mutate({
      ...data,
      id
    }, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Key result updated successfully"
        });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message
        });
      }
    });
  };

  const handleSaveEdit = (data: UpdateKeyResultInput, id: string) => {
    updateKeyResult.mutate({
      ...data,
      id
    }, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Key result updated successfully"
        });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message
        });
      }
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return <KeyResultsLoading />;
    }
    
    if (!keyResults || keyResults.length === 0) {
      return <EmptyKeyResults />;
    }
    
    return (
      <div className="space-y-4">
        {keyResults.map((kr) => (
          <KeyResultCard 
            key={kr.id}
            keyResult={kr}
            onCheckIn={handleCheckIn}
            onEdit={handleEdit}
            onDelete={handleDeleteConfirm}
          />
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Key Results</CardTitle>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
      
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
        onDelete={handleDelete}
        isDeleting={deleteKeyResult.isPending}
      />
    </Card>
  );
};
