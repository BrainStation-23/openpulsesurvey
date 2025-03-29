
import { KeyResult, KeyResultStatus, UpdateKeyResultInput, CreateKeyResultInput, MeasurementType } from '@/types/okr';
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches a key result by its ID
 */
export const fetchKeyResult = async (id: string): Promise<KeyResult | null> => {
  if (!id) return null;
  
  const { data, error } = await supabase
    .from('key_results')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    throw error;
  }
  
  return mapKeyResultData(data);
};

/**
 * Maps database key result data to KeyResult type
 */
export const mapKeyResultData = (data: any): KeyResult => {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    objectiveId: data.objective_id,
    ownerId: data.owner_id,
    krType: data.kr_type,
    measurementType: data.measurement_type as MeasurementType,
    unit: data.unit,
    startValue: data.start_value,
    currentValue: data.current_value,
    targetValue: data.target_value,
    booleanValue: data.boolean_value,
    weight: data.weight,
    status: data.status as KeyResultStatus,
    progress: data.progress,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    dueDate: data.due_date ? new Date(data.due_date) : undefined
  } as KeyResult;
};

/**
 * Updates a key result's status
 */
export const updateKeyResultStatus = async (id: string, status: KeyResultStatus) => {
  if (!id) throw new Error('Key Result ID is required');
  
  const { data, error } = await supabase
    .from('key_results')
    .update({ 
      status, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)
    .select();
  
  if (error) {
    throw error;
  }
  
  return data;
};

/**
 * Updates a key result's progress (current value or boolean value)
 */
export const updateKeyResultProgress = async (
  id: string, 
  data: { currentValue?: number; booleanValue?: boolean }
) => {
  if (!id) throw new Error('Key Result ID is required');
  
  const updateData: any = {
    updated_at: new Date().toISOString()
  };
  
  if (data.currentValue !== undefined) {
    updateData.current_value = data.currentValue;
  }
  
  if (data.booleanValue !== undefined) {
    updateData.boolean_value = data.booleanValue;
  }
  
  const { error } = await supabase
    .from('key_results')
    .update(updateData)
    .eq('id', id);
  
  if (error) {
    throw error;
  }
};

/**
 * Updates a key result
 */
export const updateKeyResult = async (data: UpdateKeyResultInput) => {
  if (!data.id) throw new Error('Key Result ID is required');
  
  const { error } = await supabase
    .from('key_results')
    .update({
      title: data.title,
      description: data.description,
      owner_id: data.ownerId,
      kr_type: data.krType,
      measurement_type: data.measurementType,
      unit: data.unit,
      start_value: data.startValue,
      current_value: data.currentValue,
      target_value: data.targetValue,
      boolean_value: data.booleanValue,
      weight: data.weight || 1,
      status: data.status,
      due_date: data.dueDate ? data.dueDate.toISOString() : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', data.id);
  
  if (error) {
    throw error;
  }
};

/**
 * Deletes a key result
 */
export const deleteKeyResult = async (id: string) => {
  if (!id) throw new Error('Key Result ID is required');
  
  const { error } = await supabase
    .from('key_results')
    .delete()
    .eq('id', id);
  
  if (error) {
    throw error;
  }
};

/**
 * Creates a key result
 */
export const createKeyResult = async (data: CreateKeyResultInput) => {
  const { error } = await supabase
    .from('key_results')
    .insert({
      title: data.title,
      description: data.description,
      objective_id: data.objectiveId,
      owner_id: data.ownerId,
      kr_type: data.krType,
      measurement_type: data.measurementType,
      unit: data.unit,
      start_value: data.startValue || 0,
      current_value: data.currentValue || 0,
      target_value: data.targetValue,
      boolean_value: data.booleanValue,
      weight: data.weight || 1,
      status: data.status || 'not_started',
      due_date: data.dueDate ? data.dueDate.toISOString() : null,
    });
  
  if (error) {
    throw error;
  }
};
