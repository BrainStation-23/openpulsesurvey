
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyResult, CreateKeyResultInput, UpdateKeyResultInput } from '@/types/okr';
import { useKeyResult } from '@/hooks/okr/useKeyResult';
import { supabase } from '@/integrations/supabase/client';

interface UseKeyResultFormProps {
  objectiveId: string;
  keyResult?: KeyResult;
  onClose: (success?: boolean) => void;
  mode: 'create' | 'edit';
}

export const useKeyResultForm = ({
  objectiveId,
  keyResult,
  onClose,
  mode
}: UseKeyResultFormProps) => {
  const { createKeyResult, updateKeyResult } = useKeyResult(keyResult?.id);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getUser();
  }, []);

  // Log incoming keyResult data for debugging
  useEffect(() => {
    if (mode === 'edit' && keyResult) {
      console.log('Editing key result data:', keyResult);
      console.log('Key result due date:', keyResult.dueDate);
      console.log('Due date type:', keyResult.dueDate ? typeof keyResult.dueDate : 'undefined');
      console.log('Is due date a Date object?', keyResult.dueDate instanceof Date);
      console.log('Raw due date value:', keyResult.dueDate);
    }
  }, [keyResult, mode]);

  // Process the due date from the database format
  const processDateValue = (dateValue: any): Date | undefined => {
    if (!dateValue) return undefined;
    
    try {
      // Handle different possible date formats/types
      if (dateValue instanceof Date) {
        console.log('Date is already a Date object:', dateValue);
        return dateValue;
      }
      
      // If it's a string, convert it to Date
      if (typeof dateValue === 'string') {
        console.log('Converting string to Date:', dateValue);
        return new Date(dateValue);
      }
      
      console.log('Converting value to Date:', dateValue);
      return new Date(dateValue);
    } catch (error) {
      console.error('Error processing date:', error);
      return undefined;
    }
  };
  
  // Ensure we have a valid Date object for the form's dueDate field
  const dueDateValue = keyResult?.dueDate ? processDateValue(keyResult.dueDate) : undefined;
    
  console.log('Processed due date value for form:', dueDateValue);
  console.log('Is dueDateValue a Date object?', dueDateValue instanceof Date);

  const defaultValues = mode === 'edit' && keyResult ? {
    title: keyResult.title,
    description: keyResult.description || '',
    krType: keyResult.krType,
    measurementType: keyResult.measurementType,
    unit: keyResult.unit || '',
    startValue: keyResult.startValue,
    currentValue: keyResult.currentValue,
    targetValue: keyResult.targetValue,
    booleanValue: keyResult.booleanValue,
    weight: keyResult.weight,
    status: keyResult.status,
    dueDate: dueDateValue,
  } : {
    title: '',
    description: '',
    krType: 'standard',
    measurementType: 'numeric',
    unit: '',
    startValue: 0,
    currentValue: 0,
    targetValue: 100,
    booleanValue: false,
    weight: 1,
    status: 'not_started',
    dueDate: undefined,
  };

  console.log('Form default values:', defaultValues);
  console.log('Due date in defaultValues:', defaultValues.dueDate);

  const form = useForm<any>({
    defaultValues
  });

  const measurementType = form.watch('measurementType');

  // Make sure the due date is loaded correctly after form initialization
  useEffect(() => {
    if (mode === 'edit' && dueDateValue && !form.getValues('dueDate')) {
      console.log('Setting due date in form:', dueDateValue);
      form.setValue('dueDate', dueDateValue);
    }
  }, [dueDateValue, form, mode]);

  const handleSubmit = (data: any) => {
    console.log('Form submission data:', data);
    
    if (mode === 'create' && currentUserId) {
      const newKeyResult: CreateKeyResultInput = {
        title: data.title,
        description: data.description,
        objectiveId,
        ownerId: currentUserId,
        krType: data.krType,
        measurementType: data.measurementType,
        unit: data.unit,
        startValue: data.measurementType === 'boolean' ? 0 : data.startValue,
        currentValue: data.measurementType === 'boolean' ? 0 : data.currentValue,
        targetValue: data.measurementType === 'boolean' ? 1 : data.targetValue,
        booleanValue: data.measurementType === 'boolean' ? data.booleanValue : undefined,
        weight: data.weight,
        status: data.status,
        dueDate: data.dueDate,
      };
      
      console.log('Creating key result with:', newKeyResult);
      console.log('Due date being submitted:', data.dueDate);
      
      createKeyResult.mutate(newKeyResult, {
        onSuccess: () => {
          onClose(true);
        },
        onError: () => {
          onClose(false);
        }
      });
    } else if (mode === 'edit' && keyResult) {
      const updatedKeyResult: UpdateKeyResultInput = {
        id: keyResult.id,
        title: data.title,
        description: data.description,
        krType: data.krType,
        measurementType: data.measurementType,
        unit: data.unit,
        startValue: data.measurementType === 'boolean' ? 0 : data.startValue,
        currentValue: data.measurementType === 'boolean' ? 0 : data.currentValue,
        targetValue: data.measurementType === 'boolean' ? 1 : data.targetValue,
        booleanValue: data.measurementType === 'boolean' ? data.booleanValue : undefined,
        weight: data.weight,
        status: data.status,
        dueDate: data.dueDate,
      };
      
      console.log('Updating key result with:', updatedKeyResult);
      console.log('Due date being updated:', data.dueDate);
      
      updateKeyResult.mutate(updatedKeyResult, {
        onSuccess: () => {
          onClose(true);
        },
        onError: () => {
          onClose(false);
        }
      });
    }
  };

  return {
    form,
    measurementType,
    handleSubmit,
    isPending: createKeyResult.isPending || updateKeyResult.isPending
  };
};
