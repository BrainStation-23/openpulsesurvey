import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAnalysisData(campaignId: string, instanceId?: string) {
  // Get basic instance stats
  const { data: instanceStats } = useQuery({
    queryKey: ["instance-stats", instanceId],
    queryFn: async () => {
      if (!instanceId) return null;

      const { data: assignments } = await supabase
        .from("survey_assignments")
        .select("id")
        .eq("campaign_id", campaignId);

      const { data: responses } = await supabase
        .from("survey_responses")
        .select("assignment_id")
        .eq("campaign_instance_id", instanceId)
        .eq("status", "submitted");

      const totalAssignments = assignments?.length || 0;
      const completedResponses = responses?.length || 0;
      const completionRate = totalAssignments > 0 ? (completedResponses / totalAssignments) * 100 : 0;

      return {
        completionRate,
        totalAssignments,
        completedResponses
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

  // Get demographic data - location stats
  const { data: locationData } = useQuery({
    queryKey: ["location-stats", instanceId],
    queryFn: async () => {
      const { data: assignments } = await supabase
        .from("survey_assignments")
        .select(`
          id,
          user:profiles!survey_assignments_user_id_fkey (
            location:locations!profiles_location_id_fkey (
              name
            )
          ),
          responses:survey_responses!survey_responses_assignment_id_fkey (
            id,
            campaign_instance_id
          )
        `)
        .eq("campaign_id", campaignId);

      // Process location stats
      const locationMap = new Map();
      assignments?.forEach((assignment) => {
        const locationName = assignment.user?.location?.name || "Not Specified";
        const current = locationMap.get(locationName) || {
          name: locationName,
          total_assigned: 0,
          completed: 0
        };

        current.total_assigned += 1;
        if (assignment.responses?.some(r => r.campaign_instance_id === instanceId)) {
          current.completed += 1;
        }

        locationMap.set(locationName, current);
      });

      return Array.from(locationMap.values()).map(stats => ({
        ...stats,
        response_rate: Math.round((stats.completed / stats.total_assigned) * 100)
      }));
    },
    enabled: !!instanceId,
  });

  // Get demographic data - SBU stats
  const { data: sbuData } = useQuery({
    queryKey: ["sbu-stats", instanceId],
    queryFn: async () => {
      const { data: assignments } = await supabase
        .from("survey_assignments")
        .select(`
          id,
          user:profiles!survey_assignments_user_id_fkey (
            user_sbus (
              is_primary,
              sbu:sbus (
                name
              )
            )
          ),
          responses:survey_responses!survey_responses_assignment_id_fkey (
            id,
            campaign_instance_id
          )
        `)
        .eq("campaign_id", campaignId);

      // Process SBU stats
      const sbuMap = new Map();
      assignments?.forEach((assignment) => {
        const primarySbu = assignment.user?.user_sbus?.find(
          us => us.is_primary && us.sbu
        );
        
        if (!primarySbu?.sbu) return;

        const sbuName = primarySbu.sbu.name;
        const current = sbuMap.get(sbuName) || {
          name: sbuName,
          total_assigned: 0,
          completed: 0
        };

        current.total_assigned += 1;
        if (assignment.responses?.some(r => r.campaign_instance_id === instanceId)) {
          current.completed += 1;
        }

        sbuMap.set(sbuName, current);
      });

      return Array.from(sbuMap.values()).map(stats => ({
        ...stats,
        response_rate: Math.round((stats.completed / stats.total_assigned) * 100)
      }));
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
    trends: [],
    status_distribution: [],
    demographics: {
      locations: [],
      departments: []
    }
  };

  return {
    data: analysisData,
    isLoading: false,
    error: null
  };
}
