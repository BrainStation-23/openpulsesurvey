
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type CompletionRateCardProps = {
  campaignId: string;
  selectedInstanceId?: string;
};

export function CompletionRateCard({ campaignId, selectedInstanceId }: CompletionRateCardProps) {
  const { data: completionRate, isLoading } = useQuery({
    queryKey: ["completion-rate", campaignId, selectedInstanceId],
    queryFn: async () => {
      if (!selectedInstanceId) return 0;

      const { data: assignments, error: assignmentsError } = await supabase
        .from("survey_assignments")
        .select("id")
        .eq("campaign_id", campaignId);

      if (assignmentsError) throw assignmentsError;

      const { data: responses, error: responsesError } = await supabase
        .from("survey_responses")
        .select("assignment_id")
        .eq("campaign_instance_id", selectedInstanceId)
        .eq("status", "submitted");

      if (responsesError) throw responsesError;

      const totalAssignments = assignments?.length || 0;
      const completedResponses = responses?.length || 0;

      return totalAssignments > 0 ? (completedResponses / totalAssignments) * 100 : 0;
    },
    enabled: !!selectedInstanceId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Completion Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Completion Rate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {(completionRate || 0).toFixed(1)}%
        </div>
      </CardContent>
    </Card>
  );
}
