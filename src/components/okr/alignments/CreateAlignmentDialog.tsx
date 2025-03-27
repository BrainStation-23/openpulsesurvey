
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ObjectiveSearchInput } from './ObjectiveSearchInput';
import { useAlignments } from '@/hooks/okr/useAlignments';
import { Objective } from '@/types/okr';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export interface CreateAlignmentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  sourceObjectiveId: string;
  onSuccess?: () => void;
}

export const CreateAlignmentDialog: React.FC<CreateAlignmentDialogProps> = ({
  isOpen,
  onOpenChange,
  sourceObjectiveId,
  onSuccess
}) => {
  const { toast } = useToast();
  const { createAlignment } = useAlignments(sourceObjectiveId);
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
  const [alignmentType, setAlignmentType] = useState<string>('parent_child');
  const [alignmentStrength, setAlignmentStrength] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedObjective) {
      toast({
        title: 'Error',
        description: 'Please select an objective to align with',
        variant: 'destructive',
      });
      return;
    }
    
    createAlignment.mutate(
      {
        sourceObjectiveId,
        alignedObjectiveId: selectedObjective.id,
        alignmentType,
        weight: alignmentStrength
      },
      {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: 'Alignment created successfully',
          });
          handleClose();
          if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
          toast({
            title: 'Error',
            description: `Failed to create alignment: ${error.message}`,
            variant: 'destructive',
          });
        }
      }
    );
  };
  
  const handleClose = () => {
    setSelectedObjective(null);
    setAlignmentType('parent_child');
    setAlignmentStrength(1);
    setNotes('');
    onOpenChange(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Alignment</DialogTitle>
          <DialogDescription>
            Align this objective with another objective to show relationships.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="targetObjective">Select Objective to Align With</Label>
            <ObjectiveSearchInput
              onObjectiveSelect={setSelectedObjective}
              excludeObjectiveId={sourceObjectiveId}
              placeholder="Search for objectives..."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="alignmentType">Alignment Type</Label>
            <Select
              value={alignmentType}
              onValueChange={setAlignmentType}
            >
              <SelectTrigger id="alignmentType">
                <SelectValue placeholder="Select alignment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parent_child">Parent/Child Relationship</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="alignmentStrength">
              Alignment Weight ({alignmentStrength})
            </Label>
            <Input
              id="alignmentStrength"
              type="range"
              min="1"
              max="5"
              value={alignmentStrength}
              onChange={e => setAlignmentStrength(Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about this alignment..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createAlignment.isPending || !selectedObjective}>
              {createAlignment.isPending ? (
                <>
                  <LoadingSpinner size={16} className="mr-2" />
                  Creating...
                </>
              ) : (
                'Create Alignment'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
