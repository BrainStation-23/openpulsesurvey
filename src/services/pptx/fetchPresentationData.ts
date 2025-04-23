
import { supabase } from "@/integrations/supabase/client";
import { PresentationData } from "./types";

/**
 * Fetches all data required for PPTX presentation generation
 */
export async function fetchPresentationData(
  campaignId: string,
  instanceId?: string
): Promise<PresentationData> {
  // Fetch campaign with survey data
  const { data: campaign, error: campaignError } = await supabase
    .from("survey_campaigns")
    .select(`
      id,
      name,
      description,
      starts_at,
      ends_at,
      completion_rate,
      survey:surveys (
        id,
        name,
        json_data
      )
    `)
    .eq("id", campaignId)
    .single();

  if (campaignError || !campaign) {
    throw new Error(`Failed to fetch campaign: ${campaignError?.message || "Campaign not found"}`);
  }

  // Fetch campaign instance if specified
  let instance = null;
  if (instanceId) {
    const { data: instanceData, error: instanceError } = await supabase
      .from("campaign_instances")
      .select(`
        id,
        period_number,
        starts_at,
        ends_at,
        status,
        completion_rate
      `)
      .eq("id", instanceId)
      .single();

    if (instanceError) {
      throw new Error(`Failed to fetch instance: ${instanceError.message}`);
    }
    
    instance = instanceData;
  }

  // Parse survey JSON data to extract questions
  let surveyData;
  try {
    surveyData = typeof campaign.survey.json_data === 'string'
      ? JSON.parse(campaign.survey.json_data)
      : campaign.survey.json_data;
  } catch (error) {
    console.error("Error parsing survey data:", error);
    surveyData = { pages: [] };
  }

  // Extract questions from survey data
  const questions = (surveyData.pages || [])
    .flatMap((page: any) => page.elements || [])
    .map((q: any) => ({
      name: q.name || '',
      title: q.title || '',
      type: q.type || 'text',
      rateMax: q.rateMax,
      rateCount: q.rateMax === 10 ? 10 : q.rateMax || 5
    }));

  // Build the query for responses with extended user metadata
  let responsesQuery = supabase
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
    responsesQuery = responsesQuery.eq("campaign_instance_id", instanceId);
  } else {
    // If no instance is provided, filter by campaign directly
    // This might need adjusting based on your data model
    responsesQuery = responsesQuery.eq("campaign_id", campaignId);
  }

  const { data: responses, error: responsesError } = await responsesQuery;

  if (responsesError) {
    throw new Error(`Failed to fetch responses: ${responsesError.message}`);
  }

  // Fetch supervisor information separately
  const { data: supervisorData, error: supervisorError } = await supabase
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
    .in('user_id', responses?.map(r => r.user?.id) || []);

  if (supervisorError) {
    console.error("Error fetching supervisor data:", supervisorError);
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
  const processedResponses = (responses || []).map(response => {
    const answers: Record<string, any> = {};

    // Map each question to its answer
    questions.forEach(question => {
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
    
    // Get supervisor from the map
    const supervisor = supervisorMap.get(response.user?.id);

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

  // Combine all data
  return {
    campaign: {
      ...campaign,
      instance
    },
    questions,
    responses: processedResponses,
  };
}
