
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SupervisorAnalysisData {
  supervisor_id: string;
  supervisor_name: string;
  team_size: number;
  response_rate: number;
  analysis_content: string;
  generated_at: string;
}

export function useSupervisorAnalysis(campaignId?: string, instanceId?: string) {
  return useQuery({
    queryKey: ["supervisor-analysis", campaignId, instanceId],
    queryFn: async (): Promise<SupervisorAnalysisData[]> => {
      console.log("useSupervisorAnalysis: Starting fetch", { campaignId, instanceId });
      
      if (!campaignId || !instanceId) {
        console.log("useSupervisorAnalysis: Missing campaignId or instanceId");
        return [];
      }

      // First, get supervisors with at least 4 reportees
      console.log("useSupervisorAnalysis: Fetching eligible supervisors");
      const { data: eligibleSupervisors, error: supervisorError } = await supabase
        .rpc('get_supervisors_with_min_reportees', { min_reportees: 4 });

      if (supervisorError) {
        console.error("useSupervisorAnalysis: Error fetching eligible supervisors:", supervisorError);
        throw supervisorError;
      }

      console.log("useSupervisorAnalysis: Eligible supervisors found:", eligibleSupervisors?.length || 0);

      if (!eligibleSupervisors || eligibleSupervisors.length === 0) {
        console.log("useSupervisorAnalysis: No eligible supervisors found");
        return [];
      }

      const supervisorIds = eligibleSupervisors.map(s => s.supervisor_id);
      console.log("useSupervisorAnalysis: Supervisor IDs:", supervisorIds);

      // Now fetch analysis data for these supervisors
      console.log("useSupervisorAnalysis: Fetching analysis data");
      const { data: analysisData, error: analysisError } = await supabase
        .from("ai_feedback_analysis")
        .select(`
          supervisor_id,
          analysis_content,
          team_size,
          response_rate,
          generated_at,
          profiles!ai_feedback_analysis_supervisor_id_fkey(
            first_name,
            last_name
          )
        `)
        .eq("campaign_id", campaignId)
        .eq("instance_id", instanceId)
        .in("supervisor_id", supervisorIds)
        .order("generated_at", { ascending: false });

      if (analysisError) {
        console.error("useSupervisorAnalysis: Error fetching analysis data:", analysisError);
        throw analysisError;
      }

      console.log("useSupervisorAnalysis: Analysis data found:", analysisData?.length || 0);

      // If no analysis data exists, return supervisors without analysis
      if (!analysisData || analysisData.length === 0) {
        console.log("useSupervisorAnalysis: No analysis data, fetching supervisor profiles");
        
        // Fetch supervisor profiles for those who don't have analysis yet
        const { data: supervisorProfiles, error: profileError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", supervisorIds);

        if (profileError) {
          console.error("useSupervisorAnalysis: Error fetching supervisor profiles:", profileError);
          throw profileError;
        }

        console.log("useSupervisorAnalysis: Supervisor profiles found:", supervisorProfiles?.length || 0);

        return supervisorProfiles?.map(profile => ({
          supervisor_id: profile.id,
          supervisor_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown Supervisor',
          team_size: eligibleSupervisors.find(s => s.supervisor_id === profile.id)?.reportee_count || 0,
          response_rate: 0,
          analysis_content: 'No analysis available yet. Please generate supervisor feedback first.',
          generated_at: new Date().toISOString()
        })) || [];
      }

      const result = analysisData.map((item: any) => ({
        supervisor_id: item.supervisor_id,
        supervisor_name: `${item.profiles?.first_name || ''} ${item.profiles?.last_name || ''}`.trim() || 'Unknown Supervisor',
        team_size: item.team_size,
        response_rate: item.response_rate,
        analysis_content: item.analysis_content,
        generated_at: item.generated_at
      }));

      console.log("useSupervisorAnalysis: Final result:", result.length, "supervisors");
      return result;
    },
    enabled: !!campaignId && !!instanceId,
  });
}
