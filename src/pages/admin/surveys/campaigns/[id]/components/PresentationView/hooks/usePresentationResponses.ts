
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

      // Get all supervisors with at least 4 direct reports
      const { data: supervisorsWithManyReports } = await supabase
        .from("user_supervisors")
        .select('supervisor_id, count')
        .select('supervisor_id')
        .count('user_id', { alias: 'count' })
        .groupBy('supervisor_id')
        .gte('count', 4);

      const supervisorIds = supervisorsWithManyReports?.map(
        (item) => item.supervisor_id
      ) || [];

      // Build the query for responses with extended user metadata
      let query = supabase
        .from("survey_responses")
        .select(`
          id,
          response_data,
          submitted_at,
          user:profiles!survey_responses_user_id_fkey (
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
            ),
            supervisor:user_supervisors (
              is_primary,
              supervisor_profile:profiles!user_supervisors_supervisor_id_fkey (
                id,
                first_name,
                last_name
              )
            )
          )
        `);

      // If instanceId is provided, filter by it
      if (instanceId) {
        query = query.eq("campaign_instance_id", instanceId);
      }

      const { data: responses } = await query;
      return { responses, surveyData, supervisorIds };
    },
  });

  const processedData = useMemo(() => {
    if (!rawData) return null;
    
    const { responses, surveyData, supervisorIds } = rawData;
    
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

      // Find primary supervisor
      const primarySupervisor = response.user?.supervisor?.find(
        (s: any) => s.is_primary && s.supervisor_profile
      );

      let supervisor = null;
      if (primarySupervisor && supervisorIds.includes(primarySupervisor.supervisor_profile.id)) {
        // Find report count for this supervisor
        const supervisorData = supervisorIds.find(
          (s) => s === primarySupervisor.supervisor_profile.id
        );
        
        supervisor = {
          id: primarySupervisor.supervisor_profile.id,
          name: `${primarySupervisor.supervisor_profile.first_name || ""} ${
            primarySupervisor.supervisor_profile.last_name || ""
          }`.trim(),
          reportCount: supervisorData?.count || 0
        };
      }

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
          supervisor
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
