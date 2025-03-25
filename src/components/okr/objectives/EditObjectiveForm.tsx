
import React from 'react';
import { Objective, UpdateObjectiveInput } from '@/types/okr';
import { ObjectiveForm } from './ObjectiveForm';

interface EditObjectiveFormProps {
  objective: Objective;
  onSubmit: (data: UpdateObjectiveInput) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export const EditObjectiveForm = ({
  objective,
  onSubmit,
  isSubmitting,
  onCancel
}: EditObjectiveFormProps) => {
  return (
    <ObjectiveForm
      objective={objective}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      onCancel={onCancel}
    />
  );
};
