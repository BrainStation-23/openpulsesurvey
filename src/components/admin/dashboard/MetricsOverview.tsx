
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

      // Get total surveys count
      const { data: totalSurveys, error: totalSurveysError } = await supabase
        .from("surveys")
        .select("id", { count: 'exact' })
        .eq("status", "published");

      if (totalSurveysError) throw totalSurveysError;

      return {
        active_campaigns: activeCampaigns?.length || 0,
        completed_campaigns: completedCampaigns?.length || 0,
        total_surveys: totalSurveys?.length || 0,
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
        description="Currently running campaigns"
      />
      <MetricCard
        title="Completed Campaigns"
        value={metrics?.completed_campaigns ?? 0}
        icon={ChartBar}
        loading={isLoading}
        description="Finished campaign instances"
      />
      <MetricCard
        title="Published Surveys"
        value={metrics?.total_surveys ?? 0}
        icon={ChartPie}
        loading={isLoading}
        description="Available survey templates"
      />
    </div>
  );
}
