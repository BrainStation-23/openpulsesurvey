
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAnalysisData(campaignId: string, instanceId?: string) {
  // Reuse the existing instance stats query
  const { data: instanceStats } = useQuery({
    queryKey: ["instance-stats", instanceId],
    queryFn: async () => {
      if (!instanceId) return null;

      const { data: instanceData } = await supabase
        .from("campaign_instances")
        .select("completion_rate, id")
        .eq("id", instanceId)
        .single();

      const { data: assignments } = await supabase
        .from("survey_assignments")
        .select("id")
        .eq("campaign_id", campaignId);

      const { data: responses } = await supabase
        .from("survey_responses")
        .select("assignment_id")
        .eq("campaign_instance_id", instanceId)
        .eq("status", "submitted");

      return {
        completionRate: instanceData?.completion_rate,
        totalAssignments: assignments?.length || 0,
        completedResponses: responses?.length || 0
      };
    },
    enabled: !!instanceId,
  });

  // Get response trends data
  const { data: responseData } = useQuery({
    queryKey: ["instance-responses", instanceId],
    queryFn: async () => {
      const { data } = await supabase
        .from("survey_responses")
        .select(`
          created_at,
          assignment:survey_assignments!inner(campaign_id)
        `)
        .eq("campaign_instance_id", instanceId)
        .eq("assignment.campaign_id", campaignId)
        .order("created_at");

      return data?.map(response => ({
        date: response.created_at,
        responses: 1
      }));
    },
    enabled: !!instanceId,
  });

  // Get status distribution data
  const { data: statusData } = useQuery({
    queryKey: ["instance-status-distribution", instanceId],
    queryFn: async () => {
      const { data } = await supabase
        .rpc('get_campaign_instance_status_distribution', {
          p_campaign_id: campaignId,
          p_instance_id: instanceId
        });

      return data?.map(item => ({
        name: item.status,
        value: item.count
      }));
    },
    enabled: !!instanceId,
  });

  // Get demographic data
  const { data: demographicData } = useQuery({
    queryKey: ["demographic-data", instanceId],
    queryFn: async () => {
      const { data: locations } = await supabase
        .rpc('get_location_response_rates', {
          p_campaign_id: campaignId,
          p_instance_id: instanceId
        });

      const { data: departments } = await supabase
        .rpc('get_sbu_response_rates', {
          p_campaign_id: campaignId,
          p_instance_id: instanceId
        });

      return {
        locations: locations || [],
        departments: departments || []
      };
    },
    enabled: !!instanceId,
  });

  // Format all the data for AI analysis
  const analysisData = {
    overview: {
      completion_rate: instanceStats?.completionRate,
      total_assignments: instanceStats?.totalAssignments,
      completed_responses: instanceStats?.completedResponses
    },
    trends: responseData || [],
    status_distribution: statusData || [],
    demographics: demographicData || { locations: [], departments: [] }
  };

  return {
    data: analysisData,
    isLoading: false,
    error: null
  };
}
