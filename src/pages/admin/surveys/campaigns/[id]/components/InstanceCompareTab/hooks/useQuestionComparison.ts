
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { QuestionComparisonData } from "../types/instance-comparison";

export function useQuestionComparison(baseInstanceId?: string, comparisonInstanceId?: string) {
  return useQuery({
    queryKey: ["question-comparison", baseInstanceId, comparisonInstanceId],
    queryFn: async (): Promise<QuestionComparisonData | null> => {
      if (!baseInstanceId || !comparisonInstanceId) return null;

      // For now, we'll return mock data since we don't have the actual tables
      // In a real implementation, this would fetch from actual tables
      
      // Example mock data - this should be replaced with real API calls
      const mockBaseData = [
        {
          period_number: 1,
          campaign_instance_id: baseInstanceId,
          response_count: 45,
          avg_numeric_value: 4.2,
          yes_percentage: 78,
          question_key: "q1",
          text_responses: ["Good", "Excellent"]
        },
        {
          period_number: 1,
          campaign_instance_id: baseInstanceId,
          response_count: 42,
          avg_numeric_value: 3.8,
          yes_percentage: 65,
          question_key: "q2",
          text_responses: ["Average", "Needs improvement"]
        }
      ];
      
      const mockComparisonData = [
        {
          period_number: 2,
          campaign_instance_id: comparisonInstanceId,
          response_count: 50,
          avg_numeric_value: 3.9,
          yes_percentage: 70,
          question_key: "q1",
          text_responses: ["Better", "Could improve"]
        },
        {
          period_number: 2,
          campaign_instance_id: comparisonInstanceId,
          response_count: 48,
          avg_numeric_value: 4.1,
          yes_percentage: 75,
          question_key: "q2",
          text_responses: ["Much better", "Great improvement"]
        }
      ];

      return {
        baseInstance: mockBaseData,
        comparisonInstance: mockComparisonData
      };
    },
    enabled: !!baseInstanceId && !!comparisonInstanceId,
  });
}
