
import { PresentationData } from "./types";
import { fetchCampaignData } from "./data/fetchCampaignData";
import { fetchResponseBasicData } from "./data/fetchResponseData";
import { fetchUserProfiles, fetchSbuData, fetchSupervisorRelations, fetchSupervisorProfiles, createDataMaps } from "./data/fetchUserData";
import { processResponses } from "./data/processResponseData";

/**
 * Fetches all data required for PPTX presentation generation
 */
export async function fetchPresentationData(
  campaignId: string,
  instanceId?: string
): Promise<PresentationData> {
  // Step 1: Fetch campaign, instance and questions data
  const { campaign, instance, questions } = await fetchCampaignData(campaignId, instanceId);

  // Step 2: Fetch basic response data
  const basicResponses = await fetchResponseBasicData(campaignId, instanceId);

  // Step 3: Extract unique user IDs for further queries
  const userIds = [...new Set(basicResponses.map(r => r.user_id).filter(Boolean))];
  
  // If no users responded, return early with empty responses
  if (userIds.length === 0) {
    return {
      campaign: {
        ...campaign,
        instance
      },
      questions,
      responses: [],
    };
  }

  // Step 4: Fetch all user-related data in parallel
  const [userProfiles, sbuData, supervisorRelations] = await Promise.all([
    fetchUserProfiles(userIds),
    fetchSbuData(userIds),
    fetchSupervisorRelations(userIds)
  ]);

  // Step 5: Extract supervisor IDs and fetch supervisor data
  const supervisorIds = [...new Set(
    supervisorRelations
      .filter(relation => relation.is_primary && relation.supervisor_id)
      .map(relation => relation.supervisor_id)
  )];

  const supervisorProfiles = await fetchSupervisorProfiles(supervisorIds);

  // Step 6: Create data maps for efficient lookups
  const dataMaps = createDataMaps(
    userProfiles,
    sbuData,
    supervisorRelations,
    supervisorProfiles
  );

  // Step 7: Process responses with all collected data
  const processedResponses = processResponses(
    basicResponses,
    questions,
    dataMaps
  );

  // Step 8: Return the final presentation data
  return {
    campaign: {
      ...campaign,
      instance
    },
    questions,
    responses: processedResponses,
  };
}
