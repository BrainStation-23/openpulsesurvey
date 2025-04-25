
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProcessedData } from '../types/responses';

export function usePresentationResponses(campaignId: string, instanceId?: string | null) {
  return useQuery({
    queryKey: ['presentation-responses', campaignId, instanceId],
    queryFn: async (): Promise<ProcessedData> => {
      // Fetch campaign data to get survey structure
      const { data: campaign, error: campaignError } = await supabase
        .from('survey_campaigns')
        .select(`
          survey_id,
          survey:surveys(json_data)
        `)
        .eq('id', campaignId)
        .single();
      
      if (campaignError) throw campaignError;
      
      // Parse survey JSON data
      const surveyData = typeof campaign.survey.json_data === 'string'
        ? JSON.parse(campaign.survey.json_data)
        : campaign.survey.json_data;
      
      // Extract questions from survey data
      const questions = (surveyData.pages || [])
        .flatMap(page => page.elements || [])
        .map(q => ({
          name: q.name,
          title: q.title || q.name,
          type: q.type,
          rateCount: q.rateCount
        }));
      
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
      
      return {
        questions,
        responses: responses || []
      };
    },
    refetchOnWindowFocus: false,
    enabled: !!campaignId,
  });
}
