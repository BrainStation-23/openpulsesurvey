
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useKeyResults } from '@/hooks/okr/useKeyResults';
import { KeyResult } from '@/types/okr';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface KeyResultDialogProps {
  objectiveId: string;
  keyResult?: KeyResult;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  krType: z.string(),
  unit: z.string().optional(),
  startValue: z.number().default(0),
  currentValue: z.number().default(0),
  targetValue: z.number().min(1, 'Target value must be at least 1'),
  weight: z.number().min(0.1).max(10).default(1),
});

export const KeyResultDialog = ({ objectiveId, keyResult, open, onOpenChange }: KeyResultDialogProps) => {
  const { toast } = useToast();
  const { createKeyResult, updateKeyResult } = useKeyResults(objectiveId);
  const isEditing = !!keyResult;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: keyResult?.title || '',
      description: keyResult?.description || '',
      krType: keyResult?.krType || 'numeric',
      unit: keyResult?.unit || '',
      startValue: keyResult?.startValue || 0,
      currentValue: keyResult?.currentValue || 0,
      targetValue: keyResult?.targetValue || 0,
      weight: keyResult?.weight || 1,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;
      
      if (!userId) {
        toast({
          variant: "destructive",
          title: "Authentication error",
          description: "You must be logged in to create key results",
        });
        return;
      }
      
      if (isEditing && keyResult) {
        updateKeyResult.mutate({
          id: keyResult.id,
          title: values.title,
          description: values.description,
          krType: values.krType,
          unit: values.unit,
          startValue: values.startValue,
          currentValue: values.currentValue,
          targetValue: values.targetValue,
          weight: values.weight,
        }, {
          onSuccess: () => {
            toast({
              title: "Key result updated",
              description: "Your key result has been updated successfully",
            });
            onOpenChange(false);
            form.reset();
          }
        });
      } else {
        createKeyResult.mutate({
          objectiveId,
          title: values.title,
          description: values.description,
          krType: values.krType,
          unit: values.unit,
          startValue: values.startValue,
          currentValue: values.currentValue,
          targetValue: values.targetValue,
          weight: values.weight,
          ownerId: userId,
        }, {
          onSuccess: () => {
            toast({
              title: "Key result created",
              description: "Your key result has been created successfully",
            });
            onOpenChange(false);
            form.reset();
          }
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save key result",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Key Result' : 'Add Key Result'}</DialogTitle>
          <DialogDescription>
            Key results are specific, measurable outcomes that track progress toward an objective.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Increase user engagement by..." {...field} />
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add more details about this key result..." 
                      {...field} 
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="krType"
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
                        <SelectItem value="boolean">Yes/No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Users, %, $" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="startValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Value</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                        placeholder="0" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                        placeholder="100" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="1" 
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    How important is this key result compared to others? (0.1-10)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Update Key Result' : 'Create Key Result'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
