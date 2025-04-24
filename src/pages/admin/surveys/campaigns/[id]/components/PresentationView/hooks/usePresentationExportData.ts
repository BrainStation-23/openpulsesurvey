
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CampaignData } from "../types";
import { ProcessedData } from "../types/responses";

/**
 * Hook for fetching and processing presentation data for PPTX export
 * Uses the optimized RPC function for server-side data processing
 */
export function usePresentationExportData(campaignId: string, instanceId?: string) {
  return useQuery({
    queryKey: ['presentation-export-data', campaignId, instanceId],
    queryFn: async (): Promise<{ campaign: CampaignData, data: ProcessedData }> => {
      // Use the optimized RPC function to get pre-processed data
      const { data, error } = await supabase.rpc(
        'get_presentation_data_for_export',
        { 
          p_campaign_id: campaignId,
          p_instance_id: instanceId 
        }
      );

      if (error) {
        console.error('Error fetching presentation export data:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from server');
      }

      // Extract the campaign data
      const campaign: CampaignData = {
        ...data.campaign,
        survey: {
          ...data.campaign.survey,
          json_data: typeof data.campaign.survey.json_data === 'string'
            ? JSON.parse(data.campaign.survey.json_data)
            : data.campaign.survey.json_data
        }
      };

      // Handle instance data if present
      if (data.campaign.instance) {
        campaign.instance = data.campaign.instance;
      }

      // Process the response data
      const processedData: ProcessedData = {
        questions: data.questions || [],
        responses: data.responses || [],
        demographics: data.demographics || {}
      };

      return {
        campaign,
        data: processedData
      };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
}
