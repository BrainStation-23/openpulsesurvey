
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CampaignData } from "@/pages/admin/surveys/campaigns/[id]/components/PresentationView/types";
import { SharedPresentation } from "@/types/shared-presentations";
import { SurveyJsonData } from "@/pages/admin/surveys/campaigns/[id]/components/PresentationView/types";

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

      // Fetch the campaign data
      const { data: campaignData, error: campaignError } = await supabase
        .from('survey_campaigns')
        .select(`
          id,
          name,
          description,
          starts_at,
          ends_at,
          survey:survey_id (
            id,
            name,
            description,
            json_data
          )
        `)
        .eq('id', presentation.campaign_id)
        .single();
      
      if (campaignError || !campaignData) {
        throw new Error('Failed to load campaign data');
      }

      // Create a properly typed campaign object
      const campaign: CampaignData = {
        ...campaignData,
        survey: {
          ...campaignData.survey,
          // Ensure json_data is properly parsed and typed with proper type checking
          json_data: (() => {
            try {
              const rawData = campaignData.survey.json_data;
              if (typeof rawData === 'string') {
                return JSON.parse(rawData) as SurveyJsonData;
              } else if (rawData && typeof rawData === 'object') {
                // Check if it has the required pages property
                if ('pages' in rawData && Array.isArray((rawData as any).pages)) {
                  return rawData as unknown as SurveyJsonData;
                } else {
                  return { pages: [] } as SurveyJsonData;
                }
              } else {
                return { pages: [] } as SurveyJsonData;
              }
            } catch (e) {
              console.error('Error parsing survey JSON data:', e);
              return { pages: [] } as SurveyJsonData;
            }
          })()
        },
        instance: null // Will be populated if there's an instance_id
      };

      // If there's an instance_id, fetch the instance data separately
      if (presentation.instance_id) {
        const { data: instance, error: instanceError } = await supabase
          .from('campaign_instances')
          .select('id, period_number, starts_at, ends_at, status')
          .eq('id', presentation.instance_id)
          .single();

        if (!instanceError && instance) {
          campaign.instance = instance;
        }
      }

      return {
        presentation,
        campaign,
        instance_id: presentation.instance_id
      };
    },
    refetchOnWindowFocus: false,
  });
}
