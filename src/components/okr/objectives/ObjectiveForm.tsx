
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CreateObjectiveInput, Objective, ObjectiveVisibility, UpdateObjectiveInput } from '@/types/okr';
import { UserSelector } from '@/components/okr/permissions/UserSelector';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useOkrPermissions } from '@/hooks/okr/useOkrPermissions';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from 'lucide-react';

// Define the form schema
const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().optional(),
  cycleId: z.string().uuid({ message: "Please select a valid OKR cycle" }),
  visibility: z.enum(['private', 'team', 'department', 'organization']),
  parentObjectiveId: z.string().uuid().optional().nullable(),
  sbuId: z.string().uuid().optional().nullable(),
  ownerId: z.string().uuid(),
});

type FormValues = z.infer<typeof formSchema>;

interface ObjectiveFormProps {
  onSubmit: (data: CreateObjectiveInput | UpdateObjectiveInput) => void;
  isSubmitting: boolean;
  objective?: Objective;
  initialCycleId?: string;
  onCancel?: () => void;
}

export const ObjectiveForm: React.FC<ObjectiveFormProps> = ({
  onSubmit,
  isSubmitting,
  objective,
  initialCycleId,
  onCancel
}) => {
  const { userId, isAdmin } = useCurrentUser();
  const [parentObjectiveOptions, setParentObjectiveOptions] = useState<{ id: string; title: string }[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<string | null>(null);
  
  // Get permissions to determine allowed visibility options
  const { 
    canCreateObjectives,
    canCreateOrgObjectives, 
    canCreateDeptObjectives, 
    canCreateTeamObjectives,
    isLoading: permissionsLoading 
  } = useOkrPermissions();

  // Create a map of user permissions for clearer permission checking
  const userPermissions = {
    team: canCreateTeamObjectives || canCreateObjectives,
    department: canCreateDeptObjectives || canCreateObjectives,
    organization: canCreateOrgObjectives || canCreateObjectives,
    private: true // Everyone can create private objectives
  };

  // Get OKR cycles
  const { data: cycles } = useQuery({
    queryKey: ['okrCycles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('okr_cycles')
        .select('id, name')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Get SBU options
  const { data: sbus } = useQuery({
    queryKey: ['sbus'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sbus')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Log permission info for debugging
  useEffect(() => {
    if (!permissionsLoading) {
      console.log('User Permissions for Objective Form:', {
        canCreateObjectives,
        canCreateOrgObjectives,
        canCreateDeptObjectives,
        canCreateTeamObjectives,
        userPermissions,
        isAdmin
      });
    }
  }, [permissionsLoading, canCreateObjectives, canCreateOrgObjectives, canCreateDeptObjectives, canCreateTeamObjectives, isAdmin]);

  // Determine initial visibility based on permissions
  const getDefaultVisibility = (): ObjectiveVisibility => {
    if (objective) return objective.visibility;
    
    // Select the most specific visibility level the user has permission for
    if (userPermissions.team) return 'team';
    if (userPermissions.department) return 'department';
    if (userPermissions.organization) return 'organization';
    return 'private';
  };

  // Initialize form with objective data if editing, otherwise use defaults
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: objective?.title || '',
      description: objective?.description || '',
      cycleId: objective?.cycleId || initialCycleId || '',
      visibility: objective?.visibility || getDefaultVisibility(),
      parentObjectiveId: objective?.parentObjectiveId || null,
      sbuId: objective?.sbuId || null,
      ownerId: objective?.ownerId || userId || '',
    },
  });

  // Set selectedOwner based on form value
  useEffect(() => {
    const currentOwner = form.watch('ownerId');
    if (currentOwner) {
      setSelectedOwner(currentOwner);
    }
  }, [form.watch('ownerId')]);

  // Fetch parent objective options when cycleId changes
  useEffect(() => {
    const cycleId = form.watch('cycleId');
    
    if (cycleId) {
      const fetchParentObjectives = async () => {
        const { data, error } = await supabase
          .from('objectives')
          .select('id, title')
          .eq('cycle_id', cycleId)
          .is('parent_objective_id', null);
        
        if (error) {
          console.error('Error fetching parent objectives:', error);
          return;
        }
        
        // Filter out the current objective if it exists
        const filteredOptions = objective ? data.filter(item => item.id !== objective.id) : data;
        setParentObjectiveOptions(filteredOptions);
      };
      
      fetchParentObjectives();
    }
  }, [form.watch('cycleId'), objective]);

  // Handle form submission
  const handleSubmit = (values: FormValues) => {
    // Check if user has permission for the selected visibility
    const selectedVisibility = values.visibility;
    
    if (!isAdmin && !userPermissions[selectedVisibility]) {
      form.setError('visibility', { 
        type: 'manual', 
        message: `You don't have permission to create ${selectedVisibility} objectives`
      });
      return;
    }
    
    // Transform values to match API expectations if needed
    onSubmit({
      ...values,
      parentObjectiveId: values.parentObjectiveId || undefined
    });
  };

  // Handle owner change - now accepts a single userId
  const handleOwnerChange = (userId: string | null) => {
    if (userId) {
      form.setValue('ownerId', userId);
    }
    setSelectedOwner(userId);
  };

  // Determine which visibility options to show based on permissions
  const visibilityOptions = [
    {
      value: 'private',
      label: 'Private - Only visible to you and those you specifically share with',
      allowed: true,
      description: 'Everyone can create private objectives'
    },
    {
      value: 'team',
      label: 'Team - Visible to your team members',
      allowed: userPermissions.team || isAdmin,
      description: userPermissions.team ? 'You can create team objectives' : 'You do not have permission to create team objectives'
    },
    {
      value: 'department',
      label: 'Department - Visible to your entire department',
      allowed: userPermissions.department || isAdmin,
      description: userPermissions.department ? 'You can create department objectives' : 'You do not have permission to create department objectives'
    },
    {
      value: 'organization',
      label: 'Organization - Visible to the entire organization',
      allowed: userPermissions.organization || isAdmin,
      description: userPermissions.organization ? 'You can create organization objectives' : 'You do not have permission to create organization objectives'
    }
  ];
  
  // Check if the form's visibility selection is valid based on user permissions
  const isVisibilityValid = (): boolean => {
    if (isAdmin) return true;
    if (objective) return true; // Always allow editing existing objectives
    
    const selectedVisibility = form.watch('visibility');
    return userPermissions[selectedVisibility];
  };

  // Count how many visibility types the user can create
  const allowedVisibilityCount = Object.values(userPermissions).filter(Boolean).length;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Permission alert message if user has limited permissions */}
        {!isAdmin && allowedVisibilityCount < 4 && !permissionsLoading && !objective && (
          <Alert className="bg-blue-50 border-blue-200 mb-4">
            <InfoIcon className="h-4 w-4 text-blue-500" />
            <AlertDescription>
              Based on your permissions, you can only create objectives with these visibility levels: {' '}
              {Object.entries(userPermissions)
                .filter(([_, hasPermission]) => hasPermission)
                .map(([type]) => type.charAt(0).toUpperCase() + type.slice(1))
                .join(', ')}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Use grid layout for better horizontal space usage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6 md:col-span-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter objective title" {...field} />
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
                      placeholder="Describe the objective" 
                      className="min-h-[100px]"
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="cycleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>OKR Cycle</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value} 
                  disabled={!!objective}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select OKR cycle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cycles?.map(cycle => (
                      <SelectItem key={cycle.id} value={cycle.id}>
                        {cycle.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="parentObjectiveId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent Objective (Optional)</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent objective" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem key="none" value="none">None</SelectItem>
                    {parentObjectiveOptions.map(obj => (
                      <SelectItem key={obj.id} value={obj.id}>
                        {obj.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="sbuId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Unit (Optional)</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem key="none" value="none">None</SelectItem>
                    {sbus?.map(sbu => (
                      <SelectItem key={sbu.id} value={sbu.id}>
                        {sbu.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Add Owner field - only visible to admins or when editing */}
          {(isAdmin || objective) && (
            <FormField
              control={form.control}
              name="ownerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Owner</FormLabel>
                  <FormControl>
                    <UserSelector
                      selectedUsers={selectedOwner ? [selectedOwner] : []}
                      onChange={handleOwnerChange}
                      placeholder="Search for objective owner..."
                      singleSelect={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        
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
                  {visibilityOptions.map((option) => (
                    <FormItem key={option.value} className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem 
                          value={option.value} 
                          disabled={!isAdmin && !option.allowed && !objective}
                        />
                      </FormControl>
                      <div className="space-y-0.5">
                        <FormLabel className={`font-normal ${!isAdmin && !option.allowed && !objective ? 'text-gray-400' : ''}`}>
                          {option.label}
                        </FormLabel>
                        <FormDescription className="text-xs">
                          {option.description}
                        </FormDescription>
                      </div>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isSubmitting || !isVisibilityValid()}
          >
            {isSubmitting ? 'Saving...' : (objective ? 'Update Objective' : 'Create Objective')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
