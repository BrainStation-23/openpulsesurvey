
import React from 'react';
import { Form } from '@/components/ui/form';
import { KeyResult } from '@/types/okr';
import { useKeyResultForm } from '@/hooks/okr/useKeyResultForm';
import { KeyResultBasicInfo } from './form/KeyResultBasicInfo';
import { KeyResultMeasurementFields } from './form/KeyResultMeasurementFields';
import { KeyResultStatusFields } from './form/KeyResultStatusFields';
import { KeyResultFormActions } from './form/KeyResultFormActions';

interface KeyResultFormProps {
  objectiveId: string;
  keyResult?: KeyResult;
  onClose: (success?: boolean) => void;
  mode: 'create' | 'edit';
}

export const KeyResultForm: React.FC<KeyResultFormProps> = ({
  objectiveId,
  keyResult,
  onClose,
  mode
}) => {
  const { form, measurementType, handleSubmit, isPending } = useKeyResultForm({
    objectiveId,
    keyResult,
    onClose,
    mode
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Basic Information */}
        <KeyResultBasicInfo form={form} />
        
        {/* Measurement Fields (numeric values or boolean) */}
        <KeyResultMeasurementFields 
          form={form} 
          measurementType={measurementType} 
        />
        
        {/* Status, Weight and Due Date */}
        <KeyResultStatusFields form={form} />
        
        {/* Form Actions */}
        <KeyResultFormActions 
          onClose={onClose} 
          mode={mode} 
          isPending={isPending} 
        />
      </form>
    </Form>
  );
};
