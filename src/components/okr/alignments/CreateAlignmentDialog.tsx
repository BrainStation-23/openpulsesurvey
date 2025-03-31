
import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Objective, AlignmentType, CreateAlignmentInput, ObjectiveVisibility } from '@/types/okr';
import { useAlignments } from '@/hooks/okr/useAlignments';
import { useAlignmentPermissions } from '@/hooks/okr/useAlignmentPermissions';
import { ObjectiveSelection } from './create-alignment/ObjectiveSelection';
import { AlignmentForm } from './create-alignment/AlignmentForm';
import { ObjectiveSearchResults } from './create-alignment/ObjectiveSearchResults';
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { alignmentFormSchema } from './create-alignment/AlignmentForm';
import { Separator } from "@/components/ui/separator";

interface CreateAlignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceObjectiveId: string;
  onSuccess?: () => void;
}

export const CreateAlignmentDialog: React.FC<CreateAlignmentDialogProps> = ({
  open,
  onOpenChange,
  sourceObjectiveId,
  onSuccess
}) => {
  const { createAlignment } = useAlignments(sourceObjectiveId);
  const { permissions, isLoading: isLoadingPermissions } = useAlignmentPermissions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
  const [relationDirection, setRelationDirection] = useState<'parent' | 'child'>('parent');
  const [visibilityFilter, setVisibilityFilter] = useState<ObjectiveVisibility | 'all'>('all');
  const [selectedSbuId, setSelectedSbuId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const form = useForm<z.infer<typeof alignmentFormSchema>>({
    resolver: zodResolver(alignmentFormSchema),
    defaultValues: {
      alignmentType: 'parent_child',
      weight: 1, // Default to 100%
    },
  });
  
  const toggleRelationDirection = () => {
    setRelationDirection(prev => prev === 'parent' ? 'child' : 'parent');
  };

  const onSubmit = async (values: z.infer<typeof alignmentFormSchema>) => {
    if (!sourceObjectiveId || !selectedObjective) return;
    
    setIsSubmitting(true);
    
    try {
      let alignmentData: CreateAlignmentInput;
      
      if (relationDirection === 'parent') {
        // Current objective will be the child, selected objective will be the parent
        alignmentData = {
          sourceObjectiveId: selectedObjective.id,
          alignedObjectiveId: sourceObjectiveId,
          alignmentType: 'parent_child',
          weight: values.weight,
        };
      } else {
        // Current objective will be the parent, selected objective will be the child
        alignmentData = {
          sourceObjectiveId: sourceObjectiveId,
          alignedObjectiveId: selectedObjective.id,
          alignmentType: 'parent_child',
          weight: values.weight,
        };
      }
      
      await createAlignment.mutateAsync(alignmentData);
      
      setSelectedObjective(null);
      form.reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating alignment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    setSelectedObjective(null);
    onOpenChange(false);
  };

  // Reset selected objective when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedObjective(null);
      setRelationDirection('parent');
      setVisibilityFilter('all');
      setSearchQuery('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Create Alignment</DialogTitle>
          <DialogDescription>
            Connect this objective with another to establish a parent-child relationship.
            The weight determines how much the child objective's progress contributes to the parent's progress.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column: Selection Configuration */}
          <div className="p-6 pt-2 border-r border-border">
            <ObjectiveSelection 
              relationDirection={relationDirection}
              toggleRelationDirection={toggleRelationDirection}
              selectedObjective={selectedObjective}
              setSelectedObjective={setSelectedObjective}
              sourceObjectiveId={sourceObjectiveId}
              visibilityFilter={visibilityFilter}
              setVisibilityFilter={setVisibilityFilter}
              permissions={permissions}
              isLoadingPermissions={isLoadingPermissions}
              selectedSbuId={selectedSbuId}
              setSelectedSbuId={setSelectedSbuId}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
          
          {/* Right Column: Search Results & Weights */}
          <div className="p-6 pt-2 flex flex-col h-full">
            {/* Search Results Section */}
            <div className="flex-grow mb-4">
              <ObjectiveSearchResults 
                currentObjectiveId={sourceObjectiveId}
                onSelect={(objective) => setSelectedObjective(objective)}
                visibilityFilter={visibilityFilter}
                permissions={permissions}
                selectedSbuId={visibilityFilter === 'department' ? selectedSbuId : undefined}
                searchQuery={searchQuery}
              />
            </div>
            
            {/* Form & Weight Section */}
            <Separator className="my-4" />
            <div>
              <AlignmentForm
                form={form}
                onSubmit={form.handleSubmit(onSubmit)}
                isSubmitting={isSubmitting}
                onCancel={handleCancel}
                selectedObjective={selectedObjective}
                relationDirection={relationDirection}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
