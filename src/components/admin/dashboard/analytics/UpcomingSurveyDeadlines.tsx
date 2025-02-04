import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Bell } from "lucide-react";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function UpcomingSurveyDeadlines() {
  const { toast } = useToast();
  
  const { data: deadlines, isLoading } = useQuery({
    queryKey: ["upcoming-deadlines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("upcoming_survey_deadlines")
        .select("*")
        .order("due_date", { ascending: true })
        .limit(5);
      
      if (error) throw error;
      return data;
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

  const handleSendReminder = async (surveyId: string) => {
    // This would typically call an edge function to send reminders
    toast({
      title: "Reminder Sent",
      description: "Survey reminder has been sent to pending respondents.",
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Deadlines
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
                    onClick={() => handleSendReminder(deadline.id)}
                  >
                    <Bell className="h-4 w-4 mr-1" />
                    Send Reminder
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
                    <span>Progress</span>
                    <span>{completionRate.toFixed(0)}%</span>
                  </div>
                  <Progress value={completionRate} className="h-2" />
                </div>
              </div>
            );
          })}

          {(!deadlines || deadlines.length === 0) && (
            <p className="text-center text-muted-foreground py-4">
              No upcoming deadlines
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}