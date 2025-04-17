
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ComparisonData } from "../types/instance-comparison";

export function useInstanceComparison(baseInstanceId?: string, comparisonInstanceId?: string) {
  return useQuery({
    queryKey: ["instance-comparison", baseInstanceId, comparisonInstanceId],
    queryFn: async (): Promise<ComparisonData | null> => {
      if (!baseInstanceId || !comparisonInstanceId) return null;

      const [baseInstanceResult, comparisonInstanceResult] = await Promise.all([
        supabase
          .from("campaign_instances")
          .select(`
            id,
            campaign_id,
            period_number,
            starts_at,
            ends_at,
            status,
            completion_rate,
            created_at,
            updated_at
          `)
          .eq('id', baseInstanceId)
          .single(),
        supabase
          .from("campaign_instances")
          .select(`
            id,
            campaign_id,
            period_number,
            starts_at,
            ends_at,
            status,
            completion_rate,
            created_at,
            updated_at
          `)
          .eq('id', comparisonInstanceId)
          .single(),
      ]);

      if (baseInstanceResult.error) throw baseInstanceResult.error;
      if (comparisonInstanceResult.error) throw comparisonInstanceResult.error;

      // Transform the data to match our expected types
      const transformToMetrics = (data: any) => {
        // Fetch additional metrics if needed in the future
        return {
          avg_rating: 4.0, // Mock data - replace with real data when available
          unique_respondents: 100, // Mock data
          total_responses: 120, // Mock data
          ends_at: data.ends_at,
          starts_at: data.starts_at,
          period_number: data.period_number,
          campaign_instance_id: data.id,
          gender_breakdown: null,
          location_breakdown: null,
          completion_rate: data.completion_rate
        };
      };

      return {
        baseInstance: transformToMetrics(baseInstanceResult.data),
        comparisonInstance: transformToMetrics(comparisonInstanceResult.data),
      };
    },
    enabled: !!baseInstanceId && !!comparisonInstanceId,
  });
}
