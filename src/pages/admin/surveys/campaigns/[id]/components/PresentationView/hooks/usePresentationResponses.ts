
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProcessedData, ProcessedResponse, Question } from "../types/responses";

export function usePresentationResponses(campaignId: string, instanceId?: string) {
  const { data: rawData, ...rest } = useQuery({
    queryKey: ["presentation-responses", campaignId, instanceId],
    queryFn: async () => {
      const { data: campaign } = await supabase
        .from("survey_campaigns")
        .select(`
          survey:surveys (
            id,
            name,
            json_data
          )
        `)
        .eq("id", campaignId)
        .single();

      if (!campaign?.survey) {
        throw new Error("Survey not found");
      }

      // Safely parse survey data
      let surveyData;
      try {
        surveyData = typeof campaign.survey.json_data === 'string' 
          ? JSON.parse(campaign.survey.json_data)
          : campaign.survey.json_data;
      } catch (error) {
        console.error("Error parsing survey data:", error);
        surveyData = { pages: [] };
      }

      // Build the query for responses with extended user metadata
      let query = supabase
        .from("survey_responses")
        .select(`
          id,
          response_data,
          submitted_at,
          user:profiles!survey_responses_user_id_fkey (
            id,
            first_name,
            last_name,
            email,
            gender,
            location:locations!profiles_location_id_fkey (
              id,
              name
            ),
            employment_type:employment_types!profiles_employment_type_id_fkey (
              id,
              name
            ),
            level:levels!profiles_level_id_fkey (
              id,
              name
            ),
            employee_type:employee_types!profiles_employee_type_id_fkey (
              id,
              name
            ),
            employee_role:employee_roles!profiles_employee_role_id_fkey (
              id,
              name
            ),
            user_sbus:user_sbus (
              is_primary,
              sbu:sbus (
                id,
                name
              )
            )
          )
        `);

      // If instanceId is provided, filter by it
      if (instanceId) {
        query = query.eq("campaign_instance_id", instanceId);
      }

      const { data: responses } = await query;

      // Fetch supervisor information separately to avoid ambiguous relationships
      const { data: supervisorData } = await supabase
        .from("user_supervisors")
        .select(`
          user_id,
          is_primary,
          supervisor:profiles!user_supervisors_supervisor_id_fkey (
            id,
            first_name,
            last_name
          )
        `)
        .in('user_id', responses?.map(r => r.user.id) || []);

      return { responses, surveyData, supervisorData };
    },
  });

  const processedData = useMemo(() => {
    if (!rawData) return null;
    
    const { responses, surveyData, supervisorData } = rawData;
    
    // Safely access survey questions with fallback
    const surveyQuestions = (surveyData?.pages || []).flatMap(
      (page: any) => page.elements || []
    ).map((q: any) => ({
      name: q.name || '',
      title: q.title || '',
      type: q.type || 'text',
      rateCount: q.rateMax === 10 ? 10 : q.rateMax || 5
    })) || [];

    if (!responses) {
      return {
        questions: surveyQuestions,
        responses: [],
      };
    }

    // Create a lookup map for supervisor data
    const supervisorMap = new Map();
    if (supervisorData) {
      supervisorData.forEach(item => {
        if (item.is_primary && item.supervisor) {
          supervisorMap.set(item.user_id, item.supervisor);
        }
      });
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

      // Find primary SBU with null checks
      const primarySbu = response.user?.user_sbus?.find(
        (us: any) => us.is_primary && us.sbu
      );
      
      // Get supervisor from the map
      const supervisor = supervisorMap.get(response.user.id);
      
      return {
        id: response.id,
        respondent: {
          name: `${response.user?.first_name || ""} ${
            response.user?.last_name || ""
          }`.trim(),
          email: response.user?.email,
          gender: response.user?.gender,
          location: response.user?.location,
          sbu: primarySbu?.sbu || null,
          employment_type: response.user?.employment_type,
          level: response.user?.level,
          employee_type: response.user?.employee_type,
          employee_role: response.user?.employee_role,
          supervisor: supervisor || null
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
