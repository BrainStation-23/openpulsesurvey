
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
    // Use explicit type annotation to avoid deep instantiation
    responsesQuery.eq("campaign_instance_id", instanceId);
  } else {
    // If no instance is provided, filter by campaign directly
    // Use explicit type annotation to avoid deep instantiation
    responsesQuery.eq("campaign_id", campaignId);
  }

  // Execute query
  const { data, error } = await responsesQuery;

  if (error) {
    throw new Error(`Failed to fetch responses: ${error.message}`);
  }

  // Explicitly cast the response data to ensure it matches the expected type
  return (data || []).map(item => ({
    id: item.id,
    response_data: item.response_data as Record<string, any>,
    submitted_at: item.submitted_at,
    user_id: item.user_id
  }));
}
