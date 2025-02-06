import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Bell } from "lucide-react";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function UpcomingSurveyDeadlines() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: deadlines, isLoading } = useQuery({
    queryKey: ["upcoming-deadlines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("upcoming_survey_deadlines")
        .select("*")
        .order("due_date", { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const sendReminderMutation = useMutation({
    mutationFn: async ({ instanceId, campaignId }: { instanceId: string, campaignId: string }) => {
      // Get all pending assignments for this campaign
      const { data: assignments, error: assignmentsError } = await supabase
        .from("survey_assignments")
        .select(`
          id,
          due_date,
          public_access_token,
          user:profiles!survey_assignments_user_id_fkey (
            email,
            first_name,
            last_name
          ),
          survey:surveys (
            name
          )
        `)
        .eq("campaign_id", campaignId)
        .eq("status", "pending");

      if (assignmentsError) throw assignmentsError;
      if (!assignments?.length) {
        throw new Error("No pending assignments found");
      }

      // Send reminders to all pending users
      const results = await Promise.allSettled(
        assignments.map(async (assignment) => {
          const response = await supabase.functions.invoke("send-survey-reminder", {
            body: {
              assignmentId: assignment.id,
              surveyName: assignment.survey.name,
              dueDate: assignment.due_date,
              recipientEmail: assignment.user.email,
              recipientName: `${assignment.user.first_name || ''} ${assignment.user.last_name || ''}`.trim() || 'Participant',
              publicAccessToken: assignment.public_access_token,
              frontendUrl: window.location.origin,
            },
          });

          if (response.error) {
            throw new Error(response.error.message);
          }

          return response;
        })
      );

      // Count successes and failures
      const successCount = results.filter(r => r.status === "fulfilled").length;
      const failureCount = results.filter(r => r.status === "rejected").length;

      return { successCount, failureCount, totalCount: assignments.length };
    },
    onSuccess: (result) => {
      toast({
        title: "Reminders Sent",
        description: `Successfully sent ${result.successCount} out of ${result.totalCount} reminders.${
          result.failureCount > 0 ? ` ${result.failureCount} failed.` : ''
        }`,
        variant: result.failureCount > 0 ? "destructive" : "default",
      });
      // Refresh the deadlines data
      queryClient.invalidateQueries({ queryKey: ["upcoming-deadlines"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send reminders",
        variant: "destructive",
      });
    }
  });

  const getUrgencyColor = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const threeDaysFromNow = addDays(now, 3);

    if (isBefore(due, now)) return "text-red-500";
    if (isBefore(due, threeDaysFromNow)) return "text-amber-500";
    return "text-green-500";
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Active Campaign Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deadlines?.map((deadline) => {
            const completionRate = ((deadline.total_assignments - deadline.pending_responses) / deadline.total_assignments) * 100;
            const urgencyColor = getUrgencyColor(deadline.due_date);

            return (
              <div key={deadline.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{deadline.survey_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {deadline.campaign_name}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => sendReminderMutation.mutate({
                      instanceId: deadline.id,
                      campaignId: deadline.campaign_id
                    })}
                    disabled={sendReminderMutation.isPending || deadline.pending_responses === 0}
                  >
                    <Bell className="h-4 w-4 mr-1" />
                    {sendReminderMutation.isPending ? "Sending..." : "Send Reminders"}
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className={`h-4 w-4 ${urgencyColor}`} />
                  <span className="text-sm">
                    Due {format(new Date(deadline.due_date), "MMM d, yyyy")}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Progress ({deadline.total_assignments - deadline.pending_responses} of {deadline.total_assignments} responses)</span>
                    <span>{completionRate.toFixed(0)}%</span>
                  </div>
                  <Progress value={completionRate} className="h-2" />
                </div>
              </div>
            );
          })}

          {(!deadlines || deadlines.length === 0) && (
            <p className="text-center text-muted-foreground py-4">
              No active campaigns requiring attention
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}