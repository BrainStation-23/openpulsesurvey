
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Bell } from "lucide-react";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface UpcomingDeadline {
  id: string;
  campaign_id: string;
  survey_name: string;
  campaign_name: string | null;
  ends_at: string;
  total_assignments: number;
  pending_responses: number;
}

export function UpcomingSurveyDeadlines() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: deadlines, isLoading } = useQuery<UpcomingDeadline[]>({
    queryKey: ["upcoming-deadlines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("upcoming_survey_deadlines")
        .select("*")
        .order("ends_at", { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  const sendReminderMutation = useMutation({
    mutationFn: async ({ instanceId, campaignId }: { instanceId: string; campaignId: string }) => {
      const { data, error } = await supabase.functions.invoke("send-survey-reminder", {
        body: {
          instanceId,
          campaignId,
          frontendUrl: window.location.origin
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (result) => {
      toast({
        title: "Reminders Sent",
        description: `Successfully sent ${result.successCount} reminders. ${
          result.failureCount > 0 ? `${result.failureCount} failed.` : ''
        } ${result.skippedCount > 0 ? `${result.skippedCount} skipped (recently reminded).` : ''}`,
        variant: result.failureCount > 0 ? "destructive" : "default",
      });
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

  const getUrgencyColor = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const threeDaysFromNow = addDays(now, 3);

    if (isBefore(end, now)) return "text-red-500";
    if (isBefore(end, threeDaysFromNow)) return "text-amber-500";
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
            const urgencyColor = getUrgencyColor(deadline.ends_at);

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
                    Due {format(new Date(deadline.ends_at), "MMM d, yyyy")}
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
