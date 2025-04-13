
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProcessedData, ProcessedResponse, Question } from "../types/responses";

export function usePresentationResponses(campaignId: string, instanceId?: string) {
  const { data: rawData, ...rest } = useQuery({
    queryKey: ["presentation-responses", campaignId, instanceId],
    queryFn: async () => {
      // Use the RPC function instead of direct queries
      const { data, error } = await supabase.rpc(
        'get_survey_responses',
        { 
          p_campaign_id: campaignId,
          p_instance_id: instanceId || null
        }
      );
      
      if (error) throw error;
      return data;
    },
  });

  const processedData = useMemo(() => {
    if (!rawData) return null;
    
    const { campaign, responses } = rawData;
    
    // Safely access survey questions with fallback
    const surveyData = campaign.survey.json_data;
    const surveyQuestions = (surveyData?.pages || []).flatMap(
      (page: any) => page.elements || []
    ).map((q: any) => ({
      name: q.name || '',
      title: q.title || '',
      type: q.type || 'text',
      rateCount: q.rateMax === 10 ? 10 : q.rateMax || 5
    })) || [];

    if (!responses || responses.length === 0) {
      return {
        questions: surveyQuestions,
        responses: [],
      };
    }

    // Process each response
    const processedResponses: ProcessedResponse[] = responses.map((response: any) => {
      const answers: Record<string, any> = {};

      // Map each question to its answer with null checks
      surveyQuestions.forEach((question: Question) => {
        const answer = response?.response_data?.[question.name];
        answers[question.name] = {
          question: question.title,
          answer: answer,
          questionType: question.type,
          rateCount: question.rateCount
        };
      });

      // Find primary SBU with null checks
      const userData = response.user_data;
      const primarySbu = userData?.user_sbus?.find(
        (us: any) => us.is_primary && us.sbu
      );

      return {
        id: response.id,
        respondent: {
          name: `${userData?.first_name || ""} ${
            userData?.last_name || ""
          }`.trim(),
          email: userData?.email,
          gender: userData?.gender,
          location: userData?.location,
          sbu: primarySbu?.sbu || null,
          employment_type: userData?.employment_type,
          level: userData?.level,
          employee_type: userData?.employee_type,
          employee_role: userData?.employee_role,
        },
        submitted_at: response.submitted_at,
        answers,
      };
    });

    return {
      questions: surveyQuestions,
      responses: processedResponses,
    };
  }, [rawData]);

  return { data: processedData, ...rest };
}
