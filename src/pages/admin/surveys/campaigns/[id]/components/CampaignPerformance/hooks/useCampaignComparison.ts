
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PeriodAnalysisDataPoint, CampaignInstance } from "../types";

export function useCampaignComparison(campaignId: string, instances: CampaignInstance[]) {
  const { data: periodAnalysis, isLoading } = useQuery({
    queryKey: ["campaign-period-analysis", campaignId],
    queryFn: async () => {
      const periodData: PeriodAnalysisDataPoint[] = [];
      
      // For each instance, get the key metrics
      for (const instance of instances) {
        const { data: responseData, error: responseError } = await supabase
          .from("survey_responses")
          .select("id, response_data")
          .eq("campaign_instance_id", instance.id);
          
        if (responseError) throw responseError;
        
        // Calculate average rating across all responses with rating questions
        let totalRating = 0;
        let ratingCount = 0;
        
        responseData.forEach(response => {
          const responseData = response.response_data as Record<string, any>;
          
          Object.values(responseData).forEach(answer => {
            if (
              typeof answer === 'object' && 
              answer?.questionType === 'rating' && 
              typeof answer.answer === 'number'
            ) {
              totalRating += answer.answer;
              ratingCount++;
            } else if (typeof answer === 'number') {
              // Handle direct number values (for simple rating responses)
              totalRating += answer;
              ratingCount++;
            }
          });
        });
        
        const avgRating = ratingCount > 0 ? totalRating / ratingCount : 0;
        
        // Get completion rate for this instance
        const { data: completionData, error: completionError } = await supabase
          .rpc("calculate_instance_completion_rate", { instance_id: instance.id });
          
        if (completionError) throw completionError;
        
        const completionRate = completionData || 0;
        
        periodData.push({
          periodNumber: instance.period_number,
          avgRating,
          completionRate,
          responseCount: responseData.length
        });
      }
      
      return periodData.sort((a, b) => a.periodNumber - b.periodNumber);
    },
    enabled: instances && instances.length > 0
  });

  return {
    periodAnalysis,
    isLoading
  };
}
