
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Play, Pause, Ban } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { SurveySelector } from "../../surveys/campaigns/components/SurveySelector";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import crypto from "crypto-random-string";

const createSessionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  survey_id: z.string().min(1, "Please select a survey")
});

type CreateSessionSchema = z.infer<typeof createSessionSchema>;

type LiveSession = {
  id: string;
  name: string;
  join_code: string;
  status: "initial" | "active" | "paused" | "ended";
  created_at: string;
  description?: string;
  survey_id: string;
};

export default function LiveSurveyPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<LiveSession | null>(null);
  const { toast } = useToast();
  const form = useForm<CreateSessionSchema>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      name: "",
      description: "",
      survey_id: ""
    }
  });

  const { data: sessions, isLoading, refetch } = useQuery({
    queryKey: ["live-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_survey_sessions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as LiveSession[];
    },
  });

  const getStatusBadgeVariant = (status: LiveSession["status"]) => {
    switch (status) {
      case "active":
        return "success";
      case "ended":
        return "secondary";
      case "paused":
        return "destructive";
      default:
        return "default";
    }
  };

  const handleEdit = (session: LiveSession) => {
    form.reset({
      name: session.name,
      description: session.description || "",
      survey_id: session.survey_id
    });
    setEditingSession(session);
    setIsCreateOpen(true);
  };

  const handleStatusChange = async (sessionId: string, newStatus: LiveSession["status"]) => {
    try {
      const { error } = await supabase
        .from('live_survey_sessions')
        .update({ status: newStatus })
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Session status updated to ${newStatus}`
      });

      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  };

  const onSubmit = async (values: CreateSessionSchema) => {
    try {
      if (editingSession) {
        // Update existing session
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
        // Create new session
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

      setIsCreateOpen(false);
      setEditingSession(null);
      form.reset();
      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  };

  const handleDialogClose = () => {
    setIsCreateOpen(false);
    setEditingSession(null);
    form.reset();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Live Survey</h1>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Sessions</CardTitle>
          <Dialog open={isCreateOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Session
              </Button>
            </DialogTrigger>
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
        </CardHeader>
        <CardContent>
          <ResponsiveTable>
            <ResponsiveTable.Header>
              <ResponsiveTable.Row>
                <ResponsiveTable.Head>Session Name</ResponsiveTable.Head>
                <ResponsiveTable.Head>Join Code</ResponsiveTable.Head>
                <ResponsiveTable.Head>Status</ResponsiveTable.Head>
                <ResponsiveTable.Head>Created</ResponsiveTable.Head>
                <ResponsiveTable.Head className="text-right">Actions</ResponsiveTable.Head>
              </ResponsiveTable.Row>
            </ResponsiveTable.Header>
            <ResponsiveTable.Body>
              {isLoading ? (
                <ResponsiveTable.Row>
                  <ResponsiveTable.Cell colSpan={5} className="text-center">
                    Loading sessions...
                  </ResponsiveTable.Cell>
                </ResponsiveTable.Row>
              ) : !sessions?.length ? (
                <ResponsiveTable.Row>
                  <ResponsiveTable.Cell colSpan={5} className="text-center">
                    No sessions found.
                  </ResponsiveTable.Cell>
                </ResponsiveTable.Row>
              ) : (
                sessions.map((session) => (
                  <ResponsiveTable.Row key={session.id}>
                    <ResponsiveTable.Cell>{session.name}</ResponsiveTable.Cell>
                    <ResponsiveTable.Cell>
                      <code className="rounded bg-muted px-2 py-1">
                        {session.join_code}
                      </code>
                    </ResponsiveTable.Cell>
                    <ResponsiveTable.Cell>
                      <Badge variant={getStatusBadgeVariant(session.status)}>
                        {session.status}
                      </Badge>
                    </ResponsiveTable.Cell>
                    <ResponsiveTable.Cell>
                      {format(new Date(session.created_at), "MMM d, yyyy")}
                    </ResponsiveTable.Cell>
                    <ResponsiveTable.Cell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEdit(session)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {session.status !== 'ended' && (
                          <>
                            {session.status !== 'active' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleStatusChange(session.id, 'active')}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            {session.status === 'active' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleStatusChange(session.id, 'paused')}
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleStatusChange(session.id, 'ended')}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </ResponsiveTable.Cell>
                  </ResponsiveTable.Row>
                ))
              )}
            </ResponsiveTable.Body>
          </ResponsiveTable>
        </CardContent>
      </Card>
    </div>
  );
}
