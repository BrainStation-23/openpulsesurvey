import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProcessedData } from "../types/responses";
import { CampaignData } from "../types";

/**
 * Hook specifically for fetching data needed for PPTX export
 * This is separate from presentation view data loading to prevent blocking the UI
 */
export function useExportData(campaignId: string, instanceId?: string) {
  return useQuery({
    queryKey: ["export-data", campaignId, instanceId],
    queryFn: async (): Promise<{ campaign: CampaignData; processedData: ProcessedData }> => {
      // Fetch campaign data
      const { data: campaign, error: campaignError } = await supabase
        .from("survey_campaigns")
        .select(`
          id,
          name,
          description,
          starts_at,
          ends_at,
          survey:surveys (
            id,
            name,
            description,
            json_data
          )
        `)
        .eq("id", campaignId)
        .single();

      if (campaignError) throw campaignError;

      // Parse survey data
      const parsedJsonData = typeof campaign.survey.json_data === 'string' 
        ? JSON.parse(campaign.survey.json_data) 
        : campaign.survey.json_data;

      // Fetch instance data if provided
      let instance = null;
      if (instanceId) {
        const { data: instanceData, error: instanceError } = await supabase
          .from("campaign_instances")
          .select("*")
          .eq("id", instanceId)
          .single();

        if (instanceError) throw instanceError;
        instance = instanceData;
      }

      // Prepare campaign data
      const campaignData: CampaignData = {
        ...campaign,
        instance,
        survey: {
          ...campaign.survey,
          json_data: parsedJsonData
        }
      };

      // Fetch and process response data - similar to usePresentationResponses but optimized for export
      const { responses, surveyData, supervisorData } = await fetchResponseData(campaignId, instanceId);
      
      // Process the data for export
      const processedData = processExportData(responses, surveyData, supervisorData);

      return { campaign: campaignData, processedData };
    },
    enabled: false, // This query doesn't run automatically - only when explicitly triggered
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
  });
}

// Helper function to fetch response data
async function fetchResponseData(campaignId: string, instanceId?: string) {
  // Fetch survey structure
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

  // Parse survey data
  let surveyData;
  try {
    surveyData = typeof campaign.survey.json_data === 'string' 
      ? JSON.parse(campaign.survey.json_data)
      : campaign.survey.json_data;
  } catch (error) {
    console.error("Error parsing survey data:", error);
    surveyData = { pages: [] };
  }

  // Build query for responses
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

  // Filter by instance if provided
  if (instanceId) {
    query = query.eq("campaign_instance_id", instanceId);
  }

  const { data: responses } = await query;

  // Fetch supervisor data
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
}

// Helper function to process data for export
function processExportData(responses: any[], surveyData: any, supervisorData: any): ProcessedData {
  // Extract survey questions
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

  // Create supervisor lookup map
  const supervisorMap = new Map();
  if (supervisorData) {
    supervisorData.forEach((item: any) => {
      if (item.is_primary && item.supervisor) {
        supervisorMap.set(item.user_id, item.supervisor);
      }
    });
  }

  // Process responses
  const processedResponses = responses.map((response: any) => {
    const answers: Record<string, any> = {};

    // Map questions to answers
    surveyQuestions.forEach((question: any) => {
      const answer = response?.response_data?.[question.name];
      answers[question.name] = {
        question: question.title,
        answer: answer,
        questionType: question.type,
        rateCount: question.rateCount
      };
    });

    // Find primary SBU
    const primarySbu = response.user?.user_sbus?.find(
      (us: any) => us.is_primary && us.sbu
    );
    
    // Get supervisor
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
}
