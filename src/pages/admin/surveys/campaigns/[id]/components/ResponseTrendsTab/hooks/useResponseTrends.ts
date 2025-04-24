
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResponseTrendData, ResponseMetrics } from "../types";

export function useResponseTrends(campaignId: string) {
  return useQuery({
    queryKey: ["campaign-response-trends", campaignId],
    queryFn: async (): Promise<{
      trends: ResponseTrendData[];
      metrics: ResponseMetrics;
    }> => {
      const { data: instances, error } = await supabase
        .from("campaign_instances")
        .select(`
          id,
          period_number,
          starts_at,
          ends_at,
          completion_rate,
          survey_responses(count)
        `)
        .eq("campaign_id", campaignId)
        .eq("status", "completed")
        .order("period_number", { ascending: true });

      if (error) throw error;

      const trends = instances.map((instance): ResponseTrendData => {
        const totalResponses = instance.survey_responses[0]?.count || 0;
        return {
          instanceId: instance.id,
          periodNumber: instance.period_number,
          startsAt: instance.starts_at,
          endsAt: instance.ends_at,
          totalResponses,
          uniqueRespondents: totalResponses, // Since each user can only respond once
          completionRate: instance.completion_rate || 0,
        };
      });

      // Calculate metrics
      const metrics: ResponseMetrics = {
        totalResponses: trends.reduce((sum, t) => sum + t.totalResponses, 0),
        averageResponseRate: trends.reduce((sum, t) => sum + t.completionRate, 0) / trends.length,
        responseGrowth: trends.length > 1 
          ? ((trends[trends.length - 1].completionRate - trends[0].completionRate) / trends[0].completionRate) * 100
          : 0,
        trendDirection: trends.length > 1
          ? trends[trends.length - 1].completionRate > trends[0].completionRate 
            ? 'up' 
            : trends[trends.length - 1].completionRate < trends[0].completionRate 
            ? 'down' 
            : 'stable'
          : 'stable'
      };

      return { trends, metrics };
    },
  });
}
