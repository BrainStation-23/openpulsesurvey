
import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { useKeyResults } from '@/hooks/okr/useKeyResults';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { KeyResult, UpdateKeyResultInput } from '@/types/okr';
import { KeyResultCheckInDialog } from './KeyResultCheckInDialog';
import { KeyResultEditDialog } from './KeyResultEditDialog';
import { KeyResultCard } from './KeyResultCard';

interface KeyResultsListProps {
  objectiveId: string;
}

export const KeyResultsList = ({ objectiveId }: KeyResultsListProps) => {
  const { keyResults, isLoading, updateKeyResult } = useKeyResults(objectiveId);
  const { toast } = useToast();
  const [selectedKeyResult, setSelectedKeyResult] = useState<KeyResult | null>(null);
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleCheckIn = (kr: KeyResult) => {
    setSelectedKeyResult(kr);
    setIsCheckInDialogOpen(true);
  };

  const handleEdit = (kr: KeyResult) => {
    setSelectedKeyResult(kr);
    setIsEditDialogOpen(true);
  };

  const handleSaveCheckIn = (data: UpdateKeyResultInput, id: string) => {
    if (!selectedKeyResult) return;
    
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
    if (!selectedKeyResult) return;
    
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Key Results</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : keyResults && keyResults.length > 0 ? (
          <div className="space-y-4">
            {keyResults.map((kr) => (
              <KeyResultCard 
                key={kr.id}
                keyResult={kr}
                onCheckIn={handleCheckIn}
                onEdit={handleEdit}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="flex justify-center mb-2">
              <PlusCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">No key results yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add key results to track progress toward this objective
            </p>
          </div>
        )}
      </CardContent>
      
      {selectedKeyResult && (
        <>
          <KeyResultCheckInDialog 
            keyResult={selectedKeyResult}
            open={isCheckInDialogOpen}
            onOpenChange={setIsCheckInDialogOpen}
            onSave={handleSaveCheckIn}
          />
          
          <KeyResultEditDialog 
            keyResult={selectedKeyResult}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSave={handleSaveEdit}
          />
        </>
      )}
    </Card>
  );
};
