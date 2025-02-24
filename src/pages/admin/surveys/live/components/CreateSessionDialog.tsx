
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { generateRandomString } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  survey_id: z.string().uuid("Please select a survey"),
});

interface CreateSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateSessionDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateSessionDialogProps) {
  const [isCreating, setIsCreating] = useState(false);
  
  const { data: surveys } = useQuery({
    queryKey: ['available-surveys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('surveys')
        .select('id, name')
        .eq('status', 'published')  // Changed from 'active' to 'published'
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      survey_id: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsCreating(true);
      
      const join_code = generateRandomString(6).toUpperCase();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Prepare the data object with all required fields
      const sessionData = {
        name: values.name,            // Required field
        description: values.description,
        survey_id: values.survey_id,  // Required field
        join_code: join_code,         // Required field
        created_by: user.id,          // Required field
        status: 'initial' as const    // Required field with proper type assertion
      };

      const { error } = await supabase
        .from('live_survey_sessions')
        .insert(sessionData);

      if (error) throw error;

      toast.success("Live session created successfully");
      form.reset();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Create session error:', error);
      toast.error("Failed to create live session");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Live Session</DialogTitle>
          <DialogDescription>
            Create a new live survey session. Participants will be able to join using the generated code.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter session name" />
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
                      {...field}
                      placeholder="Enter session description"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="survey_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Survey</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a survey" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {surveys?.map((survey) => (
                        <SelectItem key={survey.id} value={survey.id}>
                          {survey.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Create Session"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
