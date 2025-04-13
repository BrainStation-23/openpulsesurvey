
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProcessedData, ProcessedResponse, Question } from "../types/responses";

export function usePresentationResponses(campaignId: string, instanceId?: string) {
  const { data: rawData, ...rest } = useQuery({
    queryKey: ["presentation-responses", campaignId, instanceId],
    queryFn: async () => {
      // Use direct database calls instead of RPC
      const { data: surveyData, error: surveyError } = await supabase
        .from('survey_campaigns')
        .select(`
          id, 
          survey:survey_id(id, name, json_data)
        `)
        .eq('id', campaignId)
        .single();
      
      if (surveyError) throw surveyError;
      
      const { data: responses, error: responsesError } = await supabase
        .from('survey_responses')
        .select(`
          id,
          response_data,
          submitted_at,
          user:user_id(
            id,
            email,
            first_name,
            last_name,
            gender,
            location:location_id(id, name),
            employment_type:employment_type_id(id, name),
            level:level_id(id, name),
            employee_type:employee_type_id(id, name),
            employee_role:employee_role_id(id, name),
            user_sbus(
              is_primary,
              sbu:sbu_id(id, name)
            )
          )
        `)
        .eq('campaign_id', campaignId)
        .eq(instanceId ? 'campaign_instance_id' : 'id', instanceId || '');
      
      if (responsesError) throw responsesError;
      
      return {
        campaign: surveyData,
        responses: responses
      };
    },
  });

  const processedData = useMemo(() => {
    if (!rawData) return null;
    
    const { campaign, responses } = rawData;
    
    // Safely access survey questions with fallback
    const surveyData = campaign?.survey?.json_data;
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
      const userData = response.user;
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
