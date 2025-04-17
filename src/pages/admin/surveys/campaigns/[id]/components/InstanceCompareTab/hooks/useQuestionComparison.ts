
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

        // Fetch question responses from both instances using the RPC function
        const baseResponses = await supabase.rpc(
          'get_instance_question_responses',
          {
            p_campaign_id: campaignId,
            p_instance_id: baseInstanceId
          }
        );
        
        const comparisonResponses = await supabase.rpc(
          'get_instance_question_responses',
          {
            p_campaign_id: campaignId,
            p_instance_id: comparisonInstanceId
          }
        );

        if (baseResponses.error) {
          console.error("Error fetching base instance data:", baseResponses.error);
          throw new Error(`Failed to fetch base instance data: ${baseResponses.error.message}`);
        }

        if (comparisonResponses.error) {
          console.error("Error fetching comparison instance data:", comparisonResponses.error);
          throw new Error(`Failed to fetch comparison instance data: ${comparisonResponses.error.message}`);
        }

        console.log("Question data fetched successfully:", {
          baseData: baseResponses.data,
          comparisonData: comparisonResponses.data
        });

        // Fetch campaign instances to get period numbers
        const [baseInstance, comparisonInstance] = await Promise.all([
          supabase
            .from('campaign_instances')
            .select('period_number')
            .eq('id', baseInstanceId)
            .single(),
          supabase
            .from('campaign_instances')
            .select('period_number')
            .eq('id', comparisonInstanceId)
            .single()
        ]);

        // Add period_number to each response
        const baseData = baseResponses.data.map((item: any) => ({
          ...item,
          period_number: baseInstance.data?.period_number || null
        }));

        const comparisonData = comparisonResponses.data.map((item: any) => ({
          ...item,
          period_number: comparisonInstance.data?.period_number || null
        }));

        return {
          baseInstance: baseData || [],
          comparisonInstance: comparisonData || []
        };
      } catch (error) {
        console.error("Error in question comparison query:", error);
        throw error;
      }
    },
    enabled: !!campaignId && !!baseInstanceId && !!comparisonInstanceId,
  });
}
