
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CampaignData } from '../types';
import { ProcessedData } from '../types/responses';

interface ExportData {
  campaign: CampaignData;
  processedData: ProcessedData;
}

export function useExportData(campaignId: string, instanceId?: string) {
  return useQuery({
    queryKey: ['export-data', campaignId, instanceId],
    queryFn: async (): Promise<ExportData> => {
      // Fetch campaign data
      const { data: campaignData, error: campaignError } = await supabase
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
          )
        `)
        .eq('id', campaignId)
        .single();
      
      if (campaignError) throw campaignError;
      
      // Create campaign object for export
      const campaign: CampaignData = {
        ...campaignData,
        survey: {
          ...campaignData.survey,
          json_data: typeof campaignData.survey.json_data === 'string'
            ? JSON.parse(campaignData.survey.json_data)
            : campaignData.survey.json_data
        },
        instance: null
      };
      
      // If instanceId is provided, fetch instance data
      if (instanceId) {
        const { data: instance, error: instanceError } = await supabase
          .from('campaign_instances')
          .select('id, period_number, starts_at, ends_at, status, completion_rate')
          .eq('id', instanceId)
          .single();

        if (!instanceError && instance) {
          campaign.instance = instance;
        }
      }
      
      // Fetch responses for this campaign/instance
      const { data: responses, error: responsesError } = await supabase
        .from('survey_responses')
        .select(`
          id,
          submitted_at,
          answers,
          respondent:user_id (
            id,
            first_name,
            last_name,
            email,
            gender,
            sbu:sbu_id (id, name),
            location:location_id (id, name),
            employment_type:employment_type_id (id, name),
            level:level_id (id, name),
            employee_type:employee_type_id (id, name),
            employee_role:employee_role_id (id, name)
          )
        `)
        .eq('campaign_id', campaignId)
        .eq(instanceId ? 'instance_id' : 'is_latest', instanceId || true);
      
      if (responsesError) throw responsesError;
      
      // Extract questions from survey data
      const questions = (campaign.survey.json_data.pages || [])
        .flatMap(page => page.elements || [])
        .map(q => ({
          name: q.name,
          title: q.title || q.name,
          type: q.type,
          rateCount: q.rateCount
        }));
      
      // Create the processed data object
      const processedData: ProcessedData = {
        questions,
        responses: responses || []
      };
      
      return {
        campaign,
        processedData
      };
    },
    refetchOnWindowFocus: false,
    enabled: !!campaignId,
  });
}
