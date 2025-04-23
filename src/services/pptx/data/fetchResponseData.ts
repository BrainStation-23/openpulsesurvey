
import { supabase } from "@/integrations/supabase/client";
import { ResponseBasicData } from "./types";

/**
 * Fetches basic response data from Supabase
 */
export async function fetchResponseBasicData(
  campaignId: string,
  instanceId?: string
): Promise<ResponseBasicData[]> {
  // Build query for response data
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

  // Execute query
  const { data, error } = await responsesQuery;

  if (error) {
    throw new Error(`Failed to fetch responses: ${error.message}`);
  }

  return data || [];
}
