
import { supabase } from "@/integrations/supabase/client";

export async function calculateCompletionRateForInstance(campaignId: string, instanceId: string, refreshInstances: () => void): Promise<number> {
  const { data: assignments, error: assignmentError } = await supabase
    .from('survey_assignments')
    .select('id')
    .eq('campaign_id', campaignId);
    
  if (assignmentError) throw assignmentError;
  
  const { data: responses, error: responseError } = await supabase
    .from('survey_responses')
    .select('id')
    .eq('campaign_instance_id', instanceId)
    .eq('status', 'submitted');
  
  if (responseError) throw responseError;
  
  const totalAssignments = assignments?.length || 0;
  const completedResponses = responses?.length || 0;
  const completionRate = totalAssignments > 0 
    ? (completedResponses / totalAssignments) * 100 
    : 0;
  
  const { error: updateError } = await supabase
    .from('campaign_instances')
    .update({ completion_rate: completionRate })
    .eq('id', instanceId);
    
  if (updateError) throw updateError;
  
  refreshInstances();
  
  return completionRate;
}
