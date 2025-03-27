
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ObjectiveSearchInput } from './ObjectiveSearchInput';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export interface CreateAlignmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sourceObjectiveId: string;
  onSuccess?: () => void;
}

export function CreateAlignmentDialog({ 
  isOpen, 
  onOpenChange, 
  sourceObjectiveId,
  onSuccess 
}: CreateAlignmentDialogProps) {
  const [targetObjectiveId, setTargetObjectiveId] = useState('');
  const [targetObjectiveTitle, setTargetObjectiveTitle] = useState('');
  const [alignmentType, setAlignmentType] = useState('contributes_to');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleObjectiveSelected = (id: string, title: string) => {
    setTargetObjectiveId(id);
    setTargetObjectiveTitle(title);
  };

  const handleSubmit = async () => {
    if (!targetObjectiveId) {
      toast({
        title: 'Error',
        description: 'Please select a target objective',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('okr_alignments').insert({
        source_objective_id: sourceObjectiveId,
        aligned_objective_id: targetObjectiveId,
        alignment_type: alignmentType,
        alignment_notes: notes,
        created_by: user?.id
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Alignment created successfully',
      });
      
      // Reset form and close dialog
      setTargetObjectiveId('');
      setTargetObjectiveTitle('');
      setAlignmentType('contributes_to');
      setNotes('');
      onOpenChange(false);
      
      // Call onSuccess callback if provided
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error creating alignment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create alignment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Objective Alignment</DialogTitle>
          <DialogDescription>
            Define how this objective aligns with other objectives.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div>
            <Label className="mb-2 block">Target Objective</Label>
            <ObjectiveSearchInput 
              onObjectiveSelected={handleObjectiveSelected}
              excludeObjectiveId={sourceObjectiveId}
              selectedObjectiveId={targetObjectiveId}
              selectedObjectiveTitle={targetObjectiveTitle}
              placeholder="Search for an objective to align with..."
            />
          </div>

          <div className="space-y-2">
            <Label>Alignment Type</Label>
            <RadioGroup 
              value={alignmentType} 
              onValueChange={setAlignmentType}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="contributes_to" id="contributes_to" />
                <Label htmlFor="contributes_to">Contributes to</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="blocks" id="blocks" />
                <Label htmlFor="blocks">Blocks</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="related_to" id="related_to" />
                <Label htmlFor="related_to">Related to</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea 
              id="notes" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Add notes about this alignment..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <LoadingSpinner size={16} className="mr-2" /> : null}
            Create Alignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
