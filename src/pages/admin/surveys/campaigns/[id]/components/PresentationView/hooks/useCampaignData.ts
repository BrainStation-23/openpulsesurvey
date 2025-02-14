
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CampaignData, SurveyJsonData } from "../types";

export function useCampaignData(id: string | undefined, instanceId: string | null) {
  return useQuery({
    queryKey: ["campaign", id, instanceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_campaigns")
        .select(`
          id,
          name,
          description,
          starts_at,
          ends_at,
          completion_rate,
          survey:surveys (
            id,
            name,
            description,
            json_data
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      const { data: instance, error: instanceError } = await supabase
        .from("campaign_instances")
        .select("*")
        .eq("id", instanceId)
        .single();

      if (instanceError) throw instanceError;
      
      const parsedJsonData = typeof data.survey.json_data === 'string' 
        ? JSON.parse(data.survey.json_data) 
        : data.survey.json_data;

      return {
        ...data,
        instance,
        survey: {
          ...data.survey,
          json_data: parsedJsonData as SurveyJsonData
        }
      } as CampaignData;
    },
    enabled: !!id && !!instanceId,
  });
}
