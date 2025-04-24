
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";

export function useCampaignData() {
  const { id } = useParams();

  return useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      if (!id) throw new Error("Campaign ID is required");
      
      console.log("Fetching campaign data for ID:", id);
      
      const { data, error } = await supabase
        .from('survey_campaigns')
        .select(`
          *,
          survey:surveys(name),
          instances:campaign_instances(
            id,
            period_number,
            starts_at,
            ends_at,
            status
          )
        `)
        .eq('id', id);
      
      if (error) {
        console.error("Error fetching campaign:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.error("No campaign found with ID:", id);
        throw new Error("Campaign not found");
      }
      
      return data[0]; // Return the first matching campaign instead of using single()
    },
    enabled: !!id,
  });
}
