
import React, { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { OKRCycle } from '@/types/okr';
import { useOKRCycle } from '@/hooks/okr/useOKRCycle';
import { useNavigate } from 'react-router-dom';

interface DeleteCycleDialogProps {
  cycle: OKRCycle;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type DeletionOption = 'move' | 'delete';

export const DeleteCycleDialog = ({ cycle, open, onOpenChange }: DeleteCycleDialogProps) => {
  const navigate = useNavigate();
  const { checkCycleObjectives, getAvailableCycles, moveObjectivesToCycle, deleteObjectivesInCycle, deleteCycle } = useOKRCycle(cycle.id);
  
  const [objectivesCount, setObjectivesCount] = useState<number | null>(null);
  const [availableCycles, setAvailableCycles] = useState<{ id: string; name: string; status: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);
  const [deletionOption, setDeletionOption] = useState<DeletionOption>('move');
  const [targetCycleId, setTargetCycleId] = useState<string>('');
  
  useEffect(() => {
    if (open && cycle) {
      setLoading(true);
      Promise.all([
        checkCycleObjectives(cycle.id),
        getAvailableCycles()
      ]).then(([count, cycles]) => {
        setObjectivesCount(count);
        setAvailableCycles(cycles);
        if (cycles.length > 0) {
          setTargetCycleId(cycles[0].id);
        }
        setLoading(false);
      }).catch(error => {
        console.error('Error loading deletion dialog data:', error);
        setLoading(false);
      });
    }
  }, [open, cycle]);
  
  const handleDelete = async () => {
    if (!cycle) return;
    
    setProcessingAction(true);
    try {
      if (objectivesCount && objectivesCount > 0) {
        if (deletionOption === 'move') {
          if (!targetCycleId) {
            throw new Error('Please select a target cycle');
          }
          await moveObjectivesToCycle.mutateAsync({ 
            sourceCycleId: cycle.id, 
            targetCycleId: targetCycleId 
          });
        } else {
          await deleteObjectivesInCycle.mutateAsync(cycle.id);
        }
      }
      
      await deleteCycle.mutateAsync(cycle.id);
      onOpenChange(false);
      navigate('/admin/okrs/cycles');
    } catch (error) {
      console.error('Error during deletion process:', error);
    } finally {
      setProcessingAction(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete OKR Cycle</AlertDialogTitle>
          <AlertDialogDescription className="text-destructive font-medium flex items-center mt-2">
            <AlertTriangle className="h-5 w-5 mr-2" />
            This action cannot be undone
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {loading ? (
          <div className="py-6 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : objectivesCount && objectivesCount > 0 ? (
          <div className="py-4 space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-md text-amber-800 dark:text-amber-200">
              <p className="font-medium">This cycle has {objectivesCount} objectives</p>
              <p className="text-sm mt-1">Please select how you want to handle them:</p>
            </div>
            
            <RadioGroup 
              value={deletionOption} 
              onValueChange={(value) => setDeletionOption(value as DeletionOption)}
              className="mt-2 space-y-3"
            >
              {availableCycles.length > 0 && (
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="move" id="option-move" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="option-move" className="font-medium">
                      Move objectives to another cycle
                    </Label>
                    {deletionOption === 'move' && (
                      <div className="mt-2">
                        <Select
                          value={targetCycleId}
                          onValueChange={setTargetCycleId}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a cycle" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCycles.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name} ({c.status})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground pt-1">
                      All objectives will be moved to the selected cycle
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="delete" id="option-delete" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="option-delete" className="font-medium">
                    Delete all objectives
                  </Label>
                  <p className="text-sm text-destructive font-medium pt-1">
                    All objectives and their key results will be permanently deleted
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>
        ) : (
          <p className="py-4">Are you sure you want to delete the cycle "{cycle.name}"?</p>
        )}
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={processingAction}>Cancel</AlertDialogCancel>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={processingAction || (deletionOption === 'move' && !targetCycleId)}
            className="flex items-center space-x-2"
          >
            {processingAction && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {processingAction ? "Processing..." : "Delete Cycle"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
