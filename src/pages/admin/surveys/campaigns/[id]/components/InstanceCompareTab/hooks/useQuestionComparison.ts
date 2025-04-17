
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { QuestionComparisonData } from "../types/instance-comparison";

/**
 * Hook to fetch question comparison data between two campaign instances
 */
export function useQuestionComparison(
  campaignId?: string,
  baseInstanceId?: string, 
  comparisonInstanceId?: string
) {
  return useQuery({
    queryKey: ["question-comparison", campaignId, baseInstanceId, comparisonInstanceId],
    queryFn: async (): Promise<QuestionComparisonData | null> => {
      if (!campaignId || !baseInstanceId || !comparisonInstanceId) {
        console.log("Missing required parameters for question comparison", { 
          campaignId, baseInstanceId, comparisonInstanceId 
        });
        return null;
      }

      try {
        console.log("Fetching question comparison data for:", { 
          campaignId, baseInstanceId, comparisonInstanceId 
        });

        // Fetch question responses from both instances
        const [baseResponses, comparisonResponses] = await Promise.all([
          supabase.rpc('get_instance_question_responses', {
            p_campaign_id: campaignId,
            p_instance_id: baseInstanceId
          }),
          supabase.rpc('get_instance_question_responses', {
            p_campaign_id: campaignId,
            p_instance_id: comparisonInstanceId
          })
        ]);

        if (baseResponses.error || comparisonResponses.error) {
          console.error("Error fetching question data:", 
            baseResponses.error || comparisonResponses.error);
          throw new Error("Failed to fetch question response data");
        }

        console.log("Question data fetched successfully:", {
          baseData: baseResponses.data,
          comparisonData: comparisonResponses.data
        });

        return {
          baseInstance: baseResponses.data || [],
          comparisonInstance: comparisonResponses.data || []
        };
      } catch (error) {
        console.error("Error in question comparison query:", error);
        throw error;
      }
    },
    enabled: !!campaignId && !!baseInstanceId && !!comparisonInstanceId,
  });
}
