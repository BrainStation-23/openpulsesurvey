
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CampaignData } from "@/pages/admin/surveys/campaigns/[id]/components/PresentationView/types";
import { SharedPresentation } from "@/types/shared-presentations";

interface SharedPresentationData {
  presentation: SharedPresentation;
  campaign: CampaignData;
  instance_id: string | null;
}

export function useSharedPresentation(token: string) {
  return useQuery({
    queryKey: ['shared-presentation', token],
    queryFn: async (): Promise<SharedPresentationData> => {
      // First, validate the token and get the presentation data
      const { data: presentation, error: presentationError } = await supabase
        .from('shared_presentations')
        .select('*')
        .eq('access_token', token)
        .eq('is_active', true)
        .single();

      if (presentationError || !presentation) {
        throw new Error('Invalid or expired presentation link');
      }

      // Check if it's expired
      if (presentation.expires_at && new Date(presentation.expires_at) < new Date()) {
        throw new Error('This presentation link has expired');
      }

      // Fetch the campaign data with proper query structure - keep select() clean
      // and use correct filtering methods separately
      const { data: campaign, error: campaignError } = await supabase
        .from('survey_campaigns')
        .select(`
          id,
          name,
          description,
          starts_at,
          ends_at,
          completion_rate,
          survey:survey_id (
            id,
            name,
            description,
            json_data
          ),
          instance:campaign_instances(*)
        `)
        .eq('id', presentation.campaign_id);
      
      // Handle campaign data errors properly
      if (campaignError) {
        throw new Error(`Failed to load campaign data: ${campaignError.message}`);
      }
      
      if (!campaign || campaign.length === 0) {
        throw new Error('Campaign not found');
      }

      // Process the returned data
      const campaignData = campaign[0];
      
      // Ensure json_data is properly processed as an object not a string
      if (typeof campaignData.survey.json_data === 'string') {
        try {
          campaignData.survey.json_data = JSON.parse(campaignData.survey.json_data);
        } catch (e) {
          console.error('Error parsing survey JSON data:', e);
          // Provide a default empty structure that matches SurveyJsonData
          campaignData.survey.json_data = { pages: [] };
        }
      }
      
      // Filter instance data if needed
      if (presentation.instance_id && campaignData.instance) {
        campaignData.instance = Array.isArray(campaignData.instance) 
          ? campaignData.instance.filter(i => i.id === presentation.instance_id) 
          : [];
      }

      return {
        presentation,
        campaign: campaignData as CampaignData, // Type assertion after fixing the data
        instance_id: presentation.instance_id
      };
    },
    refetchOnWindowFocus: false,
  });
}
