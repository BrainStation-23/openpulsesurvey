
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CampaignData, SurveyJsonData } from "../types";

export function useCampaignData(id: string | undefined, instanceId: string | null | undefined) {
  return useQuery({
    queryKey: ["campaign", id, instanceId],
    queryFn: async () => {
      if (!id) throw new Error("Campaign ID is required");
      
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

      // If instanceId is provided, fetch instance data
      let instance = null;
      if (instanceId) {
        const { data: instanceData, error: instanceError } = await supabase
          .from("campaign_instances")
          .select("*")
          .eq("id", instanceId)
          .single();

        if (instanceError) throw instanceError;
        instance = instanceData;
      }
      
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
    enabled: !!id,
  });
}
