import { useQuery } from "@tanstack/react-query";
import { Activity, ChartBar, ChartPie, CheckCircle, Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MetricCard } from "./MetricCard";

export function MetricsOverview() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_overview_metrics")
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Surveys"
        value={metrics?.total_surveys ?? 0}
        icon={Database}
        loading={isLoading}
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
        icon={CheckCircle}
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