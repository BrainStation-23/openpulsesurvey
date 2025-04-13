
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProcessedData, ProcessedResponse, Question } from "../types/responses";
// Import the SurveyResponsesResult type from our new location
import { SurveyResponsesResult } from "../../ReportsTab/types/rpc";

export function usePresentationResponses(campaignId: string, instanceId?: string) {
  const { data: rawData, ...rest } = useQuery({
    queryKey: ["presentation-responses", campaignId, instanceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_survey_responses', {
          p_campaign_id: campaignId,
          p_instance_id: instanceId || null
        });

      if (error) throw error;
      return (data as unknown) as SurveyResponsesResult;
    },
  });

  const processedData = useMemo(() => {
    if (!rawData) return null;
    
    const { campaign, responses } = rawData;
    
    if (!campaign?.survey?.json_data) {
      return {
        questions: [],
        responses: [],
      };
    }
    
    // Safely access survey questions with fallback
    const surveyData = typeof campaign.survey.json_data === 'string'
      ? JSON.parse(campaign.survey.json_data)
      : campaign.survey.json_data;
      
    const surveyQuestions = (surveyData.pages || []).flatMap(
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
    const processedResponses: ProcessedResponse[] = responses.map((response) => {
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

      // Find primary SBU from user_data.user_sbus
      const primarySbu = response.user_data?.user_sbus?.find(
        (us: any) => us.is_primary && us.sbu
      );

      return {
        id: response.id,
        respondent: {
          name: `${response.user_data?.first_name || ""} ${
            response.user_data?.last_name || ""
          }`.trim(),
          email: response.user_data?.email,
          gender: response.user_data?.gender,
          location: response.user_data?.location,
          sbu: primarySbu?.sbu || null,
          employment_type: response.user_data?.employment_type,
          level: response.user_data?.level,
          employee_type: response.user_data?.employee_type,
          employee_role: response.user_data?.employee_role,
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
