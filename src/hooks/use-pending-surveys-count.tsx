
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePendingSurveysCount() {
  return useQuery({
    queryKey: ["pending-surveys-count"],
    queryFn: async () => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return 0;

      const { data: assignments, error } = await supabase
        .from("survey_assignments")
        .select(`
          id,
          campaign:survey_campaigns!inner (
            status
          )
        `)
        .eq("user_id", user.data.user.id)
        .neq("campaign.status", "draft");

      if (error) throw error;

      // Get pending assignments count - now including both assigned AND in_progress
      const pendingCount = await Promise.all(
        (assignments || []).map(async (assignment) => {
          // Get the active instance for this assignment's campaign
          const { data: instance } = await supabase
            .from("campaign_instances")
            .select("id")
            .eq("campaign_id", assignment.campaign.id)
            .eq("status", "active")
            .single();
            
          if (!instance) return 0;

          const { data: status } = await supabase
            .rpc('get_instance_assignment_status', {
              p_assignment_id: assignment.id,
              p_instance_id: instance.id
            });
          return (status === 'pending' || status === 'in_progress') ? 1 : 0;
        })
      ).then(results => results.reduce((a, b) => a + b, 0));

      return pendingCount;
    },
  });
}
