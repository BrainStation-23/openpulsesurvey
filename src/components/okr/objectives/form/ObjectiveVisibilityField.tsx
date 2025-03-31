
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
import { useObjectiveVisibilityPermissions } from '@/hooks/okr/useObjectiveVisibilityPermissions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LockClosedIcon } from 'lucide-react';

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
  const { canCreateTeam, canCreateDepartment, canCreateOrganization, isLoading } = useObjectiveVisibilityPermissions();

  // Set the default to private when the form loads
  React.useEffect(() => {
    if (!form.getValues('visibility')) {
      form.setValue('visibility', 'private');
    }
  }, [form]);

  const renderOption = (value: string, label: string, description: string, isDisabled: boolean) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <FormItem 
            className={`flex items-center space-x-3 space-y-0 ${isDisabled ? 'opacity-50' : ''}`}
          >
            <FormControl>
              <RadioGroupItem value={value} disabled={isDisabled} />
            </FormControl>
            <FormLabel className="font-normal flex items-center">
              {label}
              {isDisabled && <LockClosedIcon className="h-3 w-3 ml-1" />}
            </FormLabel>
          </FormItem>
        </TooltipTrigger>
        {isDisabled && (
          <TooltipContent>
            <p>You don't have permission to create objectives with this visibility level</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );

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
              defaultValue={field.value || 'private'}
              className="grid grid-cols-1 md:grid-cols-2 gap-2"
              disabled={isLoading}
            >
              {/* Private is always available */}
              {renderOption("private", "Private", "Only visible to you and those you specifically share with", false)}
              
              {/* Team visibility option */}
              {renderOption("team", "Team", "Visible to your team members", !canCreateTeam)}
              
              {/* Department visibility option */}
              {renderOption("department", "Department", "Visible to your entire department", !canCreateDepartment)}
              
              {/* Organization visibility option */}
              {renderOption("organization", "Organization", "Visible to the entire organization", !canCreateOrganization)}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
