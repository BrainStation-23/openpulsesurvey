
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
  };
  submitted_at: string;
  answers: Record<string, ProcessedAnswer>;
}

interface Question {
  name: string;
  title: string;
  type: string;
  rateCount?: number;
}

interface ProcessedData {
  questions: Question[];
  responses: ProcessedResponse[];
}

export function useResponseProcessing(campaignId: string, instanceId?: string) {
  return useQuery<ProcessedData>({
    queryKey: ["campaign-report", campaignId, instanceId],
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
      
      const { campaign, responses } = data;
      const surveyData = campaign.survey.json_data;
      
      // Extract survey questions
      const surveyQuestions = surveyData.pages?.flatMap(
        (page: any) => page.elements || []
      ) || [];

      if (!responses || responses.length === 0) {
        return {
          questions: surveyQuestions.map((q: any) => ({
            name: q.name,
            title: q.title,
            type: q.type,
            rateCount: q.rateCount,
          })),
          responses: [],
        };
      }

      // Process each response
      const processedResponses: ProcessedResponse[] = responses.map((response: any) => {
        const answers: Record<string, ProcessedAnswer> = {};

        // Map each question to its answer
        surveyQuestions.forEach((question: any) => {
          const answer = response.response_data[question.name];
          answers[question.name] = {
            question: question.title,
            answer: answer,
            questionType: question.type,
            rateCount: question.rateCount // Add rateCount to the processed answer
          };
        });

        // Find primary SBU
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
        questions: surveyQuestions.map((q: any) => ({
          name: q.name,
          title: q.title,
          type: q.type,
          rateCount: q.rateMax === 10 ? 10 : q.rateMax || 5,
        })),
        responses: processedResponses,
      };
    },
  });
}
