
import { supabase } from "@/integrations/supabase/client";
import { PresentationData, ProcessedResponse } from "./types";

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

  // First, fetch basic response data without the nested joins to avoid deep type instantiation
  const responsesQuery = supabase
    .from("survey_responses")
    .select(`
      id,
      response_data,
      submitted_at,
      user_id
    `);

  // Filter by instance if provided
  if (instanceId) {
    responsesQuery.eq("campaign_instance_id", instanceId);
  } else {
    // If no instance is provided, filter by campaign directly
    responsesQuery.eq("campaign_id", campaignId);
  }

  const { data: basicResponses, error: responsesError } = await responsesQuery;

  if (responsesError) {
    throw new Error(`Failed to fetch responses: ${responsesError.message}`);
  }

  // Extract the user IDs for further queries
  const userIds = basicResponses?.map(r => r.user_id).filter(Boolean) || [];
  
  // Now fetch user details separately to avoid deep nesting
  const { data: userDetails, error: userError } = await supabase
    .from("profiles")
    .select(`
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
      )
    `)
    .in('id', userIds);

  if (userError) {
    console.error("Error fetching user details:", userError);
  }

  // Fetch SBU data separately
  const { data: sbuData, error: sbuError } = await supabase
    .from("user_sbus")
    .select(`
      user_id,
      is_primary,
      sbu:sbus (
        id,
        name
      )
    `)
    .in('user_id', userIds);

  if (sbuError) {
    console.error("Error fetching SBU data:", sbuError);
  }

  // Fetch supervisor data separately
  const { data: supervisorData, error: supervisorError } = await supabase
    .from("user_supervisors")
    .select(`
      user_id,
      is_primary,
      supervisor:profiles (
        id, 
        first_name, 
        last_name
      )
    `)
    .in('user_id', userIds)
    .eq('is_primary', true);

  if (supervisorError) {
    console.error("Error fetching supervisor data:", supervisorError);
  }

  // Create lookup maps for the related data
  const userMap = new Map();
  if (userDetails) {
    userDetails.forEach(user => {
      userMap.set(user.id, user);
    });
  }

  const sbuMap = new Map();
  if (sbuData) {
    sbuData.forEach(item => {
      if (item.is_primary && item.sbu) {
        sbuMap.set(item.user_id, item.sbu);
      }
    });
  }

  const supervisorMap = new Map();
  if (supervisorData) {
    supervisorData.forEach(item => {
      if (item.is_primary && item.supervisor) {
        supervisorMap.set(item.user_id, item.supervisor);
      }
    });
  }

  // Process each response
  const processedResponses: ProcessedResponse[] = (basicResponses || []).map(response => {
    const user = userMap.get(response.user_id);
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

    return {
      id: response.id,
      respondent: {
        name: user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : "",
        email: user?.email || "",
        gender: user?.gender || null,
        location: user?.location || null,
        sbu: sbuMap.get(response.user_id) || null,
        employment_type: user?.employment_type || null,
        level: user?.level || null,
        employee_type: user?.employee_type || null,
        employee_role: user?.employee_role || null,
        supervisor: supervisorMap.get(response.user_id) || null
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
