
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

  // Convert date string to Date object if necessary
  const dueDateValue = keyResult?.dueDate 
    ? (keyResult.dueDate instanceof Date ? keyResult.dueDate : new Date(keyResult.dueDate)) 
    : undefined;
    
  console.log('Processed due date value:', dueDateValue);

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

  const form = useForm<any>({
    defaultValues
  });

  const measurementType = form.watch('measurementType');

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
