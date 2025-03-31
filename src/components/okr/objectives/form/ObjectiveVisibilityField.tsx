
import React from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  visibility: z.enum(['private', 'team', 'department', 'organization']),
});

type FormValues = z.infer<typeof formSchema>;

interface ObjectiveVisibilityFieldProps {
  form: UseFormReturn<any>;
}

export const ObjectiveVisibilityField: React.FC<ObjectiveVisibilityFieldProps> = ({
  form
}) => {
  return (
    <FormField
      control={form.control}
      name="visibility"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>Visibility</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="grid grid-cols-1 md:grid-cols-2 gap-2"
            >
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="private" />
                </FormControl>
                <FormLabel className="font-normal">
                  Private - Only visible to you and those you specifically share with
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="team" />
                </FormControl>
                <FormLabel className="font-normal">
                  Team - Visible to your team members
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="department" />
                </FormControl>
                <FormLabel className="font-normal">
                  Department - Visible to your entire department
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="organization" />
                </FormControl>
                <FormLabel className="font-normal">
                  Organization - Visible to the entire organization
                </FormLabel>
              </FormItem>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
