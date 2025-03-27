import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from "@/components/ui/checkbox"

const permissionSchema = z.object({
  can_create_objectives: z.array(z.string()).optional(),
  can_create_key_results: z.boolean().default(false),
  can_create_alignments: z.boolean().default(false),
})

const AdminOkrSettings = () => {
  const [permissionData, setPermissionData] = useState<{
    can_create_objectives: string[];
    can_create_key_results: boolean;
    can_create_alignments: boolean;
  } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof permissionSchema>>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      can_create_objectives: [],
      can_create_key_results: false,
      can_create_alignments: false,
    },
  })

  useEffect(() => {
    // Fetch permission data from Supabase
    const fetchPermissionData = async () => {
      try {
        const { data, error } = await supabase
          .from('okr_permissions')
          .select('*')
          .single();

        if (error) {
          console.error('Error fetching permission data:', error);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to load OKR settings',
          });
          return;
        }

        setPermissionData(data);
        form.reset(data);
      } catch (error) {
        console.error('Error fetching permission data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load OKR settings',
        });
      }
    };

    fetchPermissionData();
  }, [form, toast]);

  const onSubmit = async (values: z.infer<typeof permissionSchema>) => {
    try {
      const { error } = await supabase
        .from('okr_permissions')
        .upsert(values, { onConflict: 'id' });

      if (error) {
        console.error('Error updating permissions:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to update OKR settings',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'OKR settings updated successfully',
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update OKR settings',
      });
    }
  }

  // Check if it's an array before filtering
  const activeRoleIds = Array.isArray(permissionData?.can_create_objectives) 
    ? permissionData.can_create_objectives.filter(id => !!id)
    : [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">OKR Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Permissions</CardTitle>
          <CardDescription>
            Configure permissions for OKR creation and management.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsDialogOpen(true)}>
            Edit Permissions
          </Button>
          {permissionData && (
            <div className="mt-4">
              <h3 className="text-lg font-medium">Current Permissions:</h3>
              <ul className="list-disc list-inside">
                <li>
                  Can Create Objectives: {activeRoleIds.length > 0 ? activeRoleIds.join(', ') : 'No roles'}
                </li>
                <li>
                  Can Create Key Results: {permissionData.can_create_key_results ? 'Yes' : 'No'}
                </li>
                <li>
                  Can Create Alignments: {permissionData.can_create_alignments ? 'Yes' : 'No'}
                </li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit OKR Permissions</DialogTitle>
            <DialogDescription>
              Configure which roles can create objectives, key results, and alignments.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="can_create_objectives"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roles that can create objectives</FormLabel>
                    <Select
                      multiple
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select roles" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the roles that have permission to create objectives.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="can_create_key_results"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Can create key results</FormLabel>
                      <FormDescription>
                        Allow all users to create key results.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="can_create_alignments"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Can create alignments</FormLabel>
                      <FormDescription>
                        Allow all users to create alignments.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit">Update Permissions</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOkrSettings;
