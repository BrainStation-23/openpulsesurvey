
import { useQuery } from "@tanstack/react-query";
import { Activity, ChartBar, ChartPie, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MetricCard } from "./MetricCard";
import { usePendingSurveysCount } from "@/hooks/use-pending-surveys-count";

export function MetricsOverview() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_overview_metrics")
        .select("*")
        .maybeSingle();

      if (error) throw error;
      return data;
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
