
import { supabase } from "@/integrations/supabase/client";

export const calculateCompletionRateForInstance = async (
  campaignId: string,
  instanceId: string,
  refreshInstances: () => void
) => {
  try {
    const { data, error } = await supabase.rpc('calculate_instance_completion_rate', {
      instance_id: instanceId,
    });

    if (error) throw error;

    // Refresh the instances list to show updated completion rate
    refreshInstances();
    
    return data;
  } catch (error) {
    console.error("Error calculating completion rate:", error);
    throw error;
  }
};
