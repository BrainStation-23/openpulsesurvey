
import { supabase } from '@/integrations/supabase/client';
import { 
  KeyResult,
  KeyResultStatus, 
  UpdateKeyResultInput, 
  CreateKeyResultInput, 
  MeasurementType 
} from '@/types/okr';

/**
 * Fetch a single key result by ID
 */
export const fetchKeyResult = async (id: string): Promise<KeyResult | null> => {
  if (!id) return null;
  
  const { data, error } = await supabase
    .from('key_results')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching key result:', error);
    throw error;
  }
  
  if (!data) return null;
  
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    objectiveId: data.objective_id,
    ownerId: data.owner_id,
    measurementType: data.measurement_type as MeasurementType,
    startValue: data.start_value,
    currentValue: data.current_value,
    targetValue: data.target_value,
    booleanValue: data.boolean_value,
    status: data.status as KeyResultStatus,
    krType: data.kr_type,
    weight: data.weight,
    progress: data.progress,
    unit: data.unit,
    dueDate: data.due_date,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
};

/**
 * Update a key result's status
 */
export const updateKeyResultStatus = async (id: string, status: KeyResultStatus): Promise<KeyResult> => {
  const { data, error } = await supabase
    .from('key_results')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating key result status:', error);
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    objectiveId: data.objective_id,
    ownerId: data.owner_id,
    measurementType: data.measurement_type as MeasurementType,
    startValue: data.start_value,
    currentValue: data.current_value,
    targetValue: data.target_value,
    booleanValue: data.boolean_value,
    status: data.status as KeyResultStatus,
    krType: data.kr_type,
    weight: data.weight,
    progress: data.progress,
    unit: data.unit,
    dueDate: data.due_date,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
};

/**
 * Update a key result's progress
 */
export const updateKeyResultProgress = async (id: string, data: { currentValue?: number; booleanValue?: boolean }): Promise<KeyResult> => {
  const updateData: any = {};

  // Update the progress based on the measurement type
  if ('currentValue' in data && data.currentValue !== undefined) {
    updateData.current_value = data.currentValue;
    // The progress will be calculated by database trigger
  }

  if ('booleanValue' in data && data.booleanValue !== undefined) {
    updateData.boolean_value = data.booleanValue;
    // The progress will be calculated by database trigger
  }

  const { data: updatedData, error } = await supabase
    .from('key_results')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating key result progress:', error);
    throw error;
  }

  return {
    id: updatedData.id,
    title: updatedData.title,
    description: updatedData.description,
    objectiveId: updatedData.objective_id,
    ownerId: updatedData.owner_id,
    measurementType: updatedData.measurement_type as MeasurementType,
    startValue: updatedData.start_value,
    currentValue: updatedData.current_value,
    targetValue: updatedData.target_value,
    booleanValue: updatedData.boolean_value,
    status: updatedData.status as KeyResultStatus,
    krType: updatedData.kr_type,
    weight: updatedData.weight,
    progress: updatedData.progress,
    unit: updatedData.unit,
    dueDate: updatedData.due_date,
    createdAt: new Date(updatedData.created_at),
    updatedAt: new Date(updatedData.updated_at)
  };
};

/**
 * Update an existing key result
 */
export const updateKeyResult = async (data: UpdateKeyResultInput): Promise<KeyResult> => {
  if (!data.id) throw new Error('Key result ID is required');

  const updateData: any = {};

  if (data.title) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.measurementType) updateData.measurement_type = data.measurementType;
  if (data.startValue !== undefined) updateData.start_value = data.startValue;
  if (data.currentValue !== undefined) updateData.current_value = data.currentValue;
  if (data.targetValue !== undefined) updateData.target_value = data.targetValue;
  if (data.booleanValue !== undefined) updateData.boolean_value = data.booleanValue;
  if (data.status) updateData.status = data.status;
  if (data.krType) updateData.kr_type = data.krType;
  if (data.weight !== undefined) {
    // Make sure weight is a number between 0 and 1
    updateData.weight = Math.max(0, Math.min(1, data.weight));
  }
  if (data.unit !== undefined) updateData.unit = data.unit;
  if (data.dueDate !== undefined) updateData.due_date = data.dueDate;

  const { data: updatedData, error } = await supabase
    .from('key_results')
    .update(updateData)
    .eq('id', data.id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating key result:', error);
    throw error;
  }

  return {
    id: updatedData.id,
    title: updatedData.title,
    description: updatedData.description,
    objectiveId: updatedData.objective_id,
    ownerId: updatedData.owner_id,
    measurementType: updatedData.measurement_type as MeasurementType,
    startValue: updatedData.start_value,
    currentValue: updatedData.current_value,
    targetValue: updatedData.target_value,
    booleanValue: updatedData.boolean_value,
    status: updatedData.status as KeyResultStatus,
    krType: updatedData.kr_type,
    weight: updatedData.weight,
    progress: updatedData.progress,
    unit: updatedData.unit,
    dueDate: updatedData.due_date,
    createdAt: new Date(updatedData.created_at),
    updatedAt: new Date(updatedData.updated_at)
  };
};

/**
 * Delete a key result
 */
export const deleteKeyResult = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('key_results')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting key result:', error);
    throw error;
  }
};

/**
 * Create a new key result
 */
export const createKeyResult = async (data: CreateKeyResultInput): Promise<KeyResult> => {
  const insertData: any = {
    objective_id: data.objectiveId,
    title: data.title,
    description: data.description || '',
    measurement_type: data.measurementType,
    start_value: data.startValue || 0,
    current_value: data.currentValue || data.startValue || 0,
    target_value: data.targetValue || 0,
    boolean_value: data.booleanValue || false,
    status: data.status || 'not_started',
    kr_type: data.krType || 'standard',
    owner_id: data.ownerId,
    // Ensure weight is between 0 and 1
    weight: Math.max(0, Math.min(1, data.weight || 1)),
    unit: data.unit || '',
    due_date: data.dueDate || null
  };
  
  // Initial progress will be calculated by database trigger

  const { data: createdData, error } = await supabase
    .from('key_results')
    .insert(insertData)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating key result:', error);
    throw error;
  }

  return {
    id: createdData.id,
    title: createdData.title,
    description: createdData.description,
    objectiveId: createdData.objective_id,
    ownerId: createdData.owner_id,
    measurementType: createdData.measurement_type as MeasurementType,
    startValue: createdData.start_value,
    currentValue: createdData.current_value,
    targetValue: createdData.target_value,
    booleanValue: createdData.boolean_value,
    status: createdData.status as KeyResultStatus,
    krType: createdData.kr_type,
    weight: createdData.weight,
    progress: createdData.progress,
    unit: createdData.unit,
    dueDate: createdData.due_date,
    createdAt: new Date(createdData.created_at),
    updatedAt: new Date(createdData.updated_at)
  };
};
