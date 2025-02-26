
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const issueBoardFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  status: z.enum(['active', 'disabled']).default('active')  // Changed from 'archived' to 'disabled'
});

type IssueBoardFormValues = z.infer<typeof issueBoardFormSchema>;

interface IssueBoardFormProps {
  onSubmit: (values: IssueBoardFormValues) => void;
  initialValues?: Partial<IssueBoardFormValues>;
  submitLabel?: string;
}

export function IssueBoardForm({ 
  onSubmit, 
  initialValues, 
  submitLabel = "Create Board" 
}: IssueBoardFormProps) {
  const form = useForm<IssueBoardFormValues>({
    resolver: zodResolver(issueBoardFormSchema),
    defaultValues: {
      name: initialValues?.name || "",
      description: initialValues?.description || "",
      status: initialValues?.status || "active"
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter board name" {...field} />
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
                  placeholder="Enter board description" 
                  {...field} 
                  value={field.value || ''}
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
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value === 'active'}
                  onCheckedChange={(checked) => {
                    field.onChange(checked ? 'active' : 'disabled');  // Changed from 'archived' to 'disabled'
                  }}
                />
              </FormControl>
              <FormLabel className="font-normal">Active</FormLabel>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}
