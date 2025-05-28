
import { useQuery } from "@tanstack/react-query";
import { Activity, ChartBar, ChartPie, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MetricCard } from "./MetricCard";
import { usePendingSurveysCount } from "@/hooks/use-pending-surveys-count";

export function MetricsOverview() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      // Get active campaigns count
      const { data: activeCampaigns, error: activeCampaignsError } = await supabase
        .from("campaign_instances")
        .select("id", { count: 'exact' })
        .eq("status", "active");

      if (activeCampaignsError) throw activeCampaignsError;

      // Get completed campaigns count
      const { data: completedCampaigns, error: completedCampaignsError } = await supabase
        .from("campaign_instances")
        .select("id", { count: 'exact' })
        .eq("status", "completed");

      if (completedCampaignsError) throw completedCampaignsError;

      // Calculate average completion rate across all completed instances
      const { data: completedInstancesData, error: completedInstancesError } = await supabase
        .from("campaign_instances")
        .select("id")
        .eq("status", "completed");

      if (completedInstancesError) throw completedInstancesError;

      let avgCompletionRate = 0;
      if (completedInstancesData && completedInstancesData.length > 0) {
        let totalCompletionRate = 0;
        let validInstances = 0;

        for (const instance of completedInstancesData) {
          // Get total assignments for this instance
          const { data: assignments, error: assignmentsError } = await supabase
            .from("survey_assignments")
            .select("id", { count: 'exact' })
            .eq("campaign_id", instance.id);

          if (assignmentsError) continue;

          // Get completed responses for this instance
          const { data: responses, error: responsesError } = await supabase
            .from("survey_responses")
            .select("id", { count: 'exact' })
            .eq("campaign_instance_id", instance.id)
            .eq("status", "submitted");

          if (responsesError) continue;

          const totalAssignments = assignments?.length || 0;
          const completedResponses = responses?.length || 0;

          if (totalAssignments > 0) {
            const completionRate = (completedResponses / totalAssignments) * 100;
            totalCompletionRate += completionRate;
            validInstances++;
          }
        }

        if (validInstances > 0) {
          avgCompletionRate = Math.round(totalCompletionRate / validInstances);
        }
      }

      return {
        active_campaigns: activeCampaigns?.length || 0,
        completed_campaigns: completedCampaigns?.length || 0,
        avg_completion_rate: avgCompletionRate,
      };
    },
  });

  const { data: pendingSurveysCount, isLoading: isPendingLoading } = usePendingSurveysCount();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Pending Surveys"
        value={pendingSurveysCount ?? 0}
        icon={AlertCircle}
        loading={isPendingLoading}
        description="Surveys requiring your attention"
      />
      <MetricCard
        title="Active Campaigns"
        value={metrics?.active_campaigns ?? 0}
        icon={Activity}
        loading={isLoading}
      />
      <MetricCard
        title="Completed Campaigns"
        value={metrics?.completed_campaigns ?? 0}
        icon={ChartBar}
        loading={isLoading}
      />
      <MetricCard
        title="Average Completion Rate"
        value={`${metrics?.avg_completion_rate ?? 0}%`}
        icon={ChartPie}
        loading={isLoading}
      />
    </div>
  );
}
