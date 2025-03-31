
import React from 'react';
import { CreateObjectiveInput } from '@/types/okr';
import { ObjectiveForm } from './ObjectiveForm';

interface CreateObjectiveFormProps {
  onSubmit: (data: CreateObjectiveInput) => void;
  isSubmitting: boolean;
  cycleId?: string;
  onCancel?: () => void;
  hideParentObjective?: boolean;
}

export const CreateObjectiveForm = ({ 
  onSubmit, 
  isSubmitting, 
  cycleId,
  onCancel,
  hideParentObjective = false
}: CreateObjectiveFormProps) => {
  return (
    <ObjectiveForm
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      initialCycleId={cycleId}
      onCancel={onCancel}
      hideParentObjective={hideParentObjective}
    />
  );
};
