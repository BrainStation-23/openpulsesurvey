
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SurveyResponsesResult } from "../types/rpc";

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
    email: string | null;
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
      const { data, error } = await supabase
        .rpc('get_survey_responses', {
          p_campaign_id: campaignId,
          p_instance_id: instanceId || null
        });

      if (error) throw error;
      
      // Cast data to the correct type
      const result = (data as unknown) as SurveyResponsesResult;
      const { campaign, responses } = result;
      
      if (!campaign?.survey) {
        throw new Error("Survey not found");
      }

      // Parse survey data if needed
      const surveyData = typeof campaign.survey.json_data === 'string'
        ? JSON.parse(campaign.survey.json_data)
        : campaign.survey.json_data;

      // Extract questions from survey data
      const surveyQuestions = (surveyData.pages || []).flatMap(
        (page: any) => page.elements || []
      ).map((q: any) => ({
        name: q.name,
        title: q.title,
        type: q.type,
        rateCount: q.rateMax === 10 ? 10 : q.rateMax || 5,
      }));

      if (!responses) {
        return {
          questions: surveyQuestions,
          responses: [],
        };
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
            rateCount: question.rateCount // Add rateCount to the processed answer
          };
        });

        // Find primary SBU
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
    },
  });
}
