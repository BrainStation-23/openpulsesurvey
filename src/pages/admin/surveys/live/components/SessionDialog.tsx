
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SurveySelector } from "../../../surveys/campaigns/components/SurveySelector";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateSessionSchema, LiveSession, createSessionSchema } from "../types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import crypto from "crypto-random-string";

interface SessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingSession: LiveSession | null;
  onSuccess: () => void;
}

export function SessionDialog({ isOpen, onClose, editingSession, onSuccess }: SessionDialogProps) {
  const { toast } = useToast();
  const form = useForm<CreateSessionSchema>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      name: editingSession?.name || "",
      description: editingSession?.description || "",
      survey_id: editingSession?.survey_id || ""
    }
  });

  const onSubmit = async (values: CreateSessionSchema) => {
    try {
      if (editingSession) {
        const { error } = await supabase
          .from('live_survey_sessions')
          .update({
            name: values.name,
            description: values.description,
            survey_id: values.survey_id,
          })
          .eq('id', editingSession.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Live session updated successfully"
        });
      } else {
        const joinCode = crypto({ length: 6, type: 'distinguishable' });
        
        const { error } = await supabase
          .from('live_survey_sessions')
          .insert({
            name: values.name,
            description: values.description,
            survey_id: values.survey_id,
            join_code: joinCode,
            status: 'initial',
            created_by: (await supabase.auth.getUser()).data.user?.id
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Live session created successfully"
        });
      }

      onSuccess();
      onClose();
      form.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingSession ? "Edit Live Survey Session" : "Create Live Survey Session"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter session name" {...field} />
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
                      placeholder="Enter session description"
                      className="resize-none"
                      {...field}
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
                  <FormLabel>Select Survey</FormLabel>
                  <FormControl>
                    <SurveySelector
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit">
                {editingSession ? "Update Session" : "Create Session"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
