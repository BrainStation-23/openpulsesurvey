
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSurveyData(token: string | undefined) {
  return useQuery({
    queryKey: ["public-survey", token],
    queryFn: async () => {
      const { data: assignment, error: assignmentError } = await supabase
        .from("survey_assignments")
        .select(`
          *,
          survey:surveys (
            id,
            name,
            description,
            json_data,
            theme_settings,
            status
          ),
          campaign:survey_campaigns!survey_assignments_campaign_id_fkey (
            id,
            name,
            is_recurring,
            status
          )
        `)
        .eq("public_access_token", token)
        .maybeSingle();

      if (assignmentError) throw assignmentError;
      if (!assignment) throw new Error("Survey not found");

      let activeInstance = null;
      if (assignment.campaign_id) {
        const { data: instance, error: instanceError } = await supabase
          .from("campaign_instances")
          .select("*")
          .eq("campaign_id", assignment.campaign_id)
          .eq("status", 'active')
          .order("period_number", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (instanceError) throw instanceError;
        activeInstance = instance;
      }

      const { data: existingResponse, error: responseError } = await supabase
        .from("survey_responses")
        .select("submitted_at")
        .eq("assignment_id", assignment.id)
        .eq("campaign_instance_id", activeInstance?.id)
        .not("submitted_at", "is", null)
        .maybeSingle();

      if (responseError) throw responseError;

      return {
        assignment,
        activeInstance,
        existingResponse
      };
    },
  });
}
