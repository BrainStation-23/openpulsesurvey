
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

      // Fetch the campaign data
      const { data: campaign, error: campaignError } = await supabase
        .from('survey_campaigns')
        .select(`
          id,
          name,
          description,
          created_at,
          survey:survey_id (
            id,
            name,
            description,
            json_data
          ),
          instance:${presentation.instance_id ? `'${presentation.instance_id}'` : 'null'}
        `)
        .eq('id', presentation.campaign_id)
        .single();

      if (campaignError || !campaign) {
        throw new Error('Campaign not found');
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
