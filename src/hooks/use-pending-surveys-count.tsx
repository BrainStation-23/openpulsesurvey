
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePendingSurveysCount() {
  return useQuery({
    queryKey: ["pending-surveys-count"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return 0;

      const { data, error } = await supabase.rpc('get_pending_surveys_count', {
        p_user_id: userData.user.id
      });

      if (error) throw error;
      return data;
    },
  });
}
