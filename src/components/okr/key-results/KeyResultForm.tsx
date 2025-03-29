
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { KeyResult, CreateKeyResultInput, UpdateKeyResultInput, MeasurementType, KeyResultStatus } from '@/types/okr';
import { useKeyResult } from '@/hooks/okr/useKeyResult';
import { supabase } from '@/integrations/supabase/client';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface KeyResultFormProps {
  objectiveId: string;
  keyResult?: KeyResult;
  onClose: (success?: boolean) => void; // Updated to accept success parameter
  mode: 'create' | 'edit';
}

export const KeyResultForm: React.FC<KeyResultFormProps> = ({
  objectiveId,
  keyResult,
  onClose,
  mode
}) => {
  const { createKeyResult, updateKeyResult } = useKeyResult(keyResult?.id);
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);

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
    dueDate: keyResult.dueDate ? new Date(keyResult.dueDate) : undefined,
  } : {
    title: '',
    description: '',
    krType: 'standard',
    measurementType: 'numeric' as MeasurementType,
    unit: '',
    startValue: 0,
    currentValue: 0,
    targetValue: 100,
    booleanValue: false,
    weight: 1,
    status: 'not_started' as KeyResultStatus,
    dueDate: undefined,
  };

  const form = useForm<any>({
    defaultValues
  });

  const measurementType = form.watch('measurementType');

  const handleSubmit = (data: any) => {
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
      
      createKeyResult.mutate(newKeyResult, {
        onSuccess: () => {
          onClose(true); // Pass true to indicate successful creation
        },
        onError: () => {
          onClose(false); // Pass false on error
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
      
      updateKeyResult.mutate(updatedKeyResult, {
        onSuccess: () => {
          onClose(true); // Pass true to indicate successful update
        },
        onError: () => {
          onClose(false); // Pass false on error
        }
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Key Result title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Provide a detailed description of this key result" 
                  className="min-h-24"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="krType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="committed">Committed</SelectItem>
                    <SelectItem value="aspirational">Aspirational</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="measurementType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Measurement Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select measurement type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="numeric">Numeric</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="currency">Currency</SelectItem>
                    <SelectItem value="boolean">Boolean/Checkbox</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {measurementType !== 'boolean' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="startValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Value</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currentValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Value</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Value</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {measurementType === 'boolean' && (
          <FormField
            control={form.control}
            name="booleanValue"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4 mt-1"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Completion Status</FormLabel>
                  <p className="text-sm text-muted-foreground">Mark as completed if this task is done</p>
                </div>
              </FormItem>
            )}
          />
        )}

        {measurementType !== 'boolean' && (
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., users, items, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0.1" 
                    max="10" 
                    step="0.1" 
                    {...field} 
                    onChange={e => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="at_risk">At Risk</SelectItem>
                    <SelectItem value="on_track">On Track</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Add Due Date field */}
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date (Optional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={(e) => {
              e.preventDefault();
              onClose(false);
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createKeyResult.isPending || updateKeyResult.isPending}
          >
            {(createKeyResult.isPending || updateKeyResult.isPending) ? 'Saving...' : mode === 'create' ? 'Create Key Result' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

