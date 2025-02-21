
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
          .from("instance_comparison_metrics")
          .select("*")
          .eq("campaign_instance_id", baseInstanceId)
          .single(),
        supabase
          .from("instance_comparison_metrics")
          .select("*")
          .eq("campaign_instance_id", comparisonInstanceId)
          .single(),
      ]);

      if (baseInstanceResult.error) throw baseInstanceResult.error;
      if (comparisonInstanceResult.error) throw comparisonInstanceResult.error;

      return {
        baseInstance: baseInstanceResult.data,
        comparisonInstance: comparisonInstanceResult.data,
      };
    },
    enabled: !!baseInstanceId && !!comparisonInstanceId,
  });
}
