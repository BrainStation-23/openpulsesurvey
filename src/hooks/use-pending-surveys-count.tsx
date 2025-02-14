
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
          const { data: status } = await supabase
            .rpc('get_assignment_status', {
              p_assignment_id: assignment.id
            });
          return (status === 'assigned' || status === 'in_progress') ? 1 : 0;
        })
      ).then(results => results.reduce((a, b) => a + b, 0));

      return pendingCount;
    },
  });
}
