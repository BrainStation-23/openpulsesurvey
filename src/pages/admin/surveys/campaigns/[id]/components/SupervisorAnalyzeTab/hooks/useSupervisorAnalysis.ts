
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SupervisorAnalysisData {
  supervisor_id: string;
  supervisor_name: string;
  team_size: number;
  response_rate: number;
  analysis_content: string;
  generated_at: string;
  has_analysis: boolean;
  status: 'generated' | 'pending';
}

export interface SupervisorAnalysisStats {
  total_eligible: number;
  with_analysis: number;
  pending_analysis: number;
}

export function useSupervisorAnalysis(campaignId?: string, instanceId?: string) {
  return useQuery({
    queryKey: ["supervisor-analysis", campaignId, instanceId],
    queryFn: async (): Promise<{ supervisors: SupervisorAnalysisData[]; stats: SupervisorAnalysisStats }> => {
      console.log("useSupervisorAnalysis: Starting fetch", { campaignId, instanceId });
      
      if (!campaignId || !instanceId) {
        console.log("useSupervisorAnalysis: Missing campaignId or instanceId");
        return { supervisors: [], stats: { total_eligible: 0, with_analysis: 0, pending_analysis: 0 } };
      }

      // Fetch analysis data for this campaign and instance
      console.log("useSupervisorAnalysis: Fetching analysis data");
      const { data: analysisData, error: analysisError } = await supabase
        .from("ai_feedback_analysis")
        .select(`
          supervisor_id,
          analysis_content,
          team_size,
          response_rate,
          generated_at
        `)
        .eq("campaign_id", campaignId)
        .eq("instance_id", instanceId)
        .order("generated_at", { ascending: false });

      if (analysisError) {
        console.error("useSupervisorAnalysis: Error fetching analysis data:", analysisError);
        throw analysisError;
      }

      console.log("useSupervisorAnalysis: Analysis data found:", analysisData?.length || 0, analysisData);

      if (!analysisData || analysisData.length === 0) {
        console.log("useSupervisorAnalysis: No analysis data found");
        return { supervisors: [], stats: { total_eligible: 0, with_analysis: 0, pending_analysis: 0 } };
      }

      // Get all unique supervisor IDs from analysis data
      const supervisorIds = analysisData.map(item => item.supervisor_id);
      console.log("useSupervisorAnalysis: Supervisor IDs from analysis:", supervisorIds);

      // Fetch supervisor profiles
      console.log("useSupervisorAnalysis: Fetching supervisor profiles");
      const { data: supervisorProfiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", supervisorIds);

      if (profileError) {
        console.error("useSupervisorAnalysis: Error fetching supervisor profiles:", profileError);
        throw profileError;
      }

      console.log("useSupervisorAnalysis: Supervisor profiles found:", supervisorProfiles?.length || 0, supervisorProfiles);

      // Create profile lookup map
      const profilesMap = new Map();
      if (supervisorProfiles) {
        supervisorProfiles.forEach((profile: any) => {
          profilesMap.set(profile.id, profile);
        });
      }

      // Map analysis data to supervisor analysis format
      const supervisors: SupervisorAnalysisData[] = analysisData.map(item => {
        const profile = profilesMap.get(item.supervisor_id);
        const supervisorName = profile 
          ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown Supervisor'
          : 'Unknown Supervisor';

        console.log("useSupervisorAnalysis: Processing supervisor:", item.supervisor_id, {
          hasProfile: !!profile,
          profileData: profile,
          analysisData: item
        });

        return {
          supervisor_id: item.supervisor_id,
          supervisor_name: supervisorName,
          team_size: item.team_size,
          response_rate: item.response_rate,
          analysis_content: item.analysis_content,
          generated_at: item.generated_at,
          has_analysis: true,
          status: 'generated' as const
        };
      });

      // Calculate statistics
      const stats: SupervisorAnalysisStats = {
        total_eligible: supervisors.length,
        with_analysis: supervisors.length, // All have analysis since we're only fetching from analysis table
        pending_analysis: 0 // None pending since we're only showing those with analysis
      };

      console.log("useSupervisorAnalysis: Final result:", {
        totalSupervisors: supervisors.length,
        supervisorsWithAnalysis: supervisors.filter(s => s.has_analysis).length,
        stats,
        sampleSupervisors: supervisors.slice(0, 3)
      });

      return { supervisors, stats };
    },
    enabled: !!campaignId && !!instanceId,
  });
}
