
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePendingSurveysCount() {
  return useQuery({
    queryKey: ["pending-surveys-count"],
    queryFn: async () => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return 0;

      // First, get all active campaign instances
      const { data: activeInstances, error: instancesError } = await supabase
        .from("campaign_instances")
        .select("id, campaign_id")
        .eq("status", "active");

      if (instancesError) throw instancesError;
      if (!activeInstances?.length) return 0;

      // Get all assignments for the user
      const { data: assignments, error: assignmentsError } = await supabase
        .from("survey_assignments")
        .select("id, campaign_id")
        .eq("user_id", user.data.user.id)
        .in("campaign_id", activeInstances.map(i => i.campaign_id));

      if (assignmentsError) throw assignmentsError;
      if (!assignments?.length) return 0;

      // For each assignment, check status using the active instance
      const pendingCount = await Promise.all(
        assignments.map(async (assignment) => {
          const instance = activeInstances.find(i => i.campaign_id === assignment.campaign_id);
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
