
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CampaignInstance {
  id: string;
  campaign_id: string;
  period_number: number;
  starts_at: string;
  ends_at: string;
  status: string;
  completion_rate: number;
}

export interface Campaign {
  id: string;
  name: string;
  instances: CampaignInstance[];
}

export const useCampaignInstances = () => {
  return useQuery({
    queryKey: ['campaigns-with-instances'],
    queryFn: async (): Promise<Campaign[]> => {
      // First get active campaigns
      const { data: campaignData, error: campaignError } = await supabase
        .from('survey_campaigns')
        .select('id, name')
        .eq('status', 'active');

      if (campaignError) {
        throw campaignError;
      }

      if (!campaignData || campaignData.length === 0) {
        return [];
      }

      // For each campaign, get their instances
      const campaigns: Campaign[] = [];
      
      for (const campaign of campaignData) {
        const { data: instanceData, error: instanceError } = await supabase
          .from('campaign_instances')
          .select('*')
          .eq('campaign_id', campaign.id)
          .order('period_number', { ascending: false });
          
        if (instanceError) {
          console.error(`Error fetching instances for campaign ${campaign.id}:`, instanceError);
          continue;
        }
        
        campaigns.push({
          id: campaign.id,
          name: campaign.name,
          instances: instanceData || []
        });
      }
      
      return campaigns;
    }
  });
};
