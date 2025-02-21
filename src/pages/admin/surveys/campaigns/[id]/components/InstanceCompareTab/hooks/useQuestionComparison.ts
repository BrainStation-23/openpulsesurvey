
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { QuestionComparisonData } from "../types/instance-comparison";

export function useQuestionComparison(baseInstanceId?: string, comparisonInstanceId?: string) {
  return useQuery({
    queryKey: ["question-comparison", baseInstanceId, comparisonInstanceId],
    queryFn: async (): Promise<QuestionComparisonData | null> => {
      if (!baseInstanceId || !comparisonInstanceId) return null;

      const [baseInstanceResult, comparisonInstanceResult] = await Promise.all([
        supabase
          .from("instance_question_comparison")
          .select("*")
          .eq("campaign_instance_id", baseInstanceId),
        supabase
          .from("instance_question_comparison")
          .select("*")
          .eq("campaign_instance_id", comparisonInstanceId),
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
