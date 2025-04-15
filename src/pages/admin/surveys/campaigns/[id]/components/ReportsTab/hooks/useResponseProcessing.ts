import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProcessedAnswer {
  question: string;
  answer: any;
  questionType: string;
  rateCount?: number;
}

export interface ProcessedResponse {
  id: string;
  respondent: {
    name: string;
    email: string;
    gender: string | null;
    location: {
      id: string;
      name: string;
    } | null;
    sbu: {
      id: string;
      name: string;
    } | null;
    employment_type: {
      id: string;
      name: string;
    } | null;
    level: {
      id: string;
      name: string;
    } | null;
    employee_type: {
      id: string;
      name: string;
    } | null;
    employee_role: {
      id: string;
      name: string;
    } | null;
    supervisor: {
      id: string;
      first_name: string;
      last_name: string;
    } | null;
  };
  submitted_at: string;
  answers: Record<string, ProcessedAnswer>;
}

interface Question {
  name: string;
  title: string;
  type: string;
  rateCount?: number;
  mode?: string;
}

interface ProcessedData {
  questions: Question[];
  responses: ProcessedResponse[];
}

export function useResponseProcessing(campaignId: string, instanceId?: string) {
  return useQuery<ProcessedData>({
    queryKey: ["campaign-report", campaignId, instanceId],
    queryFn: async () => {
      // First get the survey details and its questions
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

      const surveyData = typeof campaign.survey.json_data === 'string' 
        ? JSON.parse(campaign.survey.json_data)
        : campaign.survey.json_data;

      const surveyQuestions = surveyData.pages?.flatMap(
        (page: any) => page.elements || []
      ) || [];

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
            location:locations (
              id,
              name
            ),
            employment_type:employment_types (
              id,
              name
            ),
            level:levels (
              id,
              name
            ),
            employee_type:employee_types (
              id,
              name
            ),
            employee_role:employee_roles (
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

      // Fetch supervisor information separately
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
        const answers: Record<string, ProcessedAnswer> = {};

        // Map each question to its answer
        surveyQuestions.forEach((question: any) => {
          const answer = response.response_data[question.name];
          answers[question.name] = {
            question: question.title,
            answer: answer,
            questionType: question.type,
            rateCount: question.rateCount,
            ...(question.mode && { mode: question.mode })
          };
        });

        // Find primary SBU
        const primarySbu = response.user.user_sbus?.find(
          (us: any) => us.is_primary && us.sbu
        );
        
        // Get supervisor from the map
        const supervisor = supervisorMap.get(response.user.id);

        return {
          id: response.id,
          respondent: {
            name: `${response.user.first_name || ""} ${
              response.user.last_name || ""
            }`.trim(),
            email: response.user.email,
            gender: response.user.gender,
            location: response.user.location,
            sbu: primarySbu?.sbu || null,
            employment_type: response.user.employment_type,
            level: response.user.level,
            employee_type: response.user.employee_type,
            employee_role: response.user.employee_role,
            supervisor: supervisor || null
          },
          submitted_at: response.submitted_at,
          answers,
        };
      });

      return {
        questions: surveyQuestions.map((q: any) => ({
          name: q.name,
          title: q.title,
          type: q.type,
          rateCount: q.rateCount,
          mode: q.mode,
        })),
        responses: processedResponses,
      };
    },
  });
}
