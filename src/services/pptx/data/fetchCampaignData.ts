
import { supabase } from "@/integrations/supabase/client";
import { CampaignData, InstanceData, SurveyData } from "./types";
import { SurveyQuestion } from "../types";

/**
 * Fetches campaign and instance data from Supabase
 */
export async function fetchCampaignData(
  campaignId: string,
  instanceId?: string
): Promise<{
  campaign: CampaignData;
  instance: InstanceData | null;
  questions: SurveyQuestion[];
}> {
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
  let instance: InstanceData | null = null;
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
  const questions = extractQuestionsFromSurvey(campaign.survey);

  return {
    campaign,
    instance,
    questions
  };
}

/**
 * Extracts questions from survey JSON data
 */
export function extractQuestionsFromSurvey(survey: { json_data: any }): SurveyQuestion[] {
  let surveyData: SurveyData;
  
  try {
    surveyData = typeof survey.json_data === 'string'
      ? JSON.parse(survey.json_data)
      : survey.json_data;
  } catch (error) {
    console.error("Error parsing survey data:", error);
    surveyData = { pages: [] };
  }

  // Extract questions from survey data
  return (surveyData.pages || [])
    .flatMap((page: any) => page.elements || [])
    .map((q: any) => ({
      name: q.name || '',
      title: q.title || '',
      type: q.type || 'text',
      rateMax: q.rateMax,
      rateCount: q.rateMax === 10 ? 10 : q.rateMax || 5
    }));
}
