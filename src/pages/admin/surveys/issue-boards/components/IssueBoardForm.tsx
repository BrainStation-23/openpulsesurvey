
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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { IssueBoard } from "../types";

const issueBoardFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  status: z.enum(['active', 'disabled']).default('active')
});

type IssueBoardFormValues = z.infer<typeof issueBoardFormSchema>;

interface IssueBoardFormProps {
  values: Partial<IssueBoard>;
  onChange: (values: Partial<IssueBoard>) => void;
  hasError?: boolean;
}

export function IssueBoardForm({ 
  values, 
  onChange,
  hasError = false
}: IssueBoardFormProps) {
  const form = useForm<IssueBoardFormValues>({
    resolver: zodResolver(issueBoardFormSchema),
    values: {
      name: values.name || "",
      description: values.description || "",
      status: values.status || "active"
    }
  });

  // Watch for form changes and notify parent
  React.useEffect(() => {
    const subscription = form.watch((data) => {
      onChange(data as Partial<IssueBoard>);
    });
    return () => subscription.unsubscribe();
  }, [form, onChange]);

  return (
    <div className="space-y-4">
      {hasError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please complete all required fields before proceeding.
          </AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Board Name *</FormLabel>
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
                    placeholder="Enter board description (optional)" 
                    {...field} 
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </div>
  );
}
