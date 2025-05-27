
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

      // STEP 1: Fetch existing analysis data for this campaign and instance (PRIMARY SOURCE)
      console.log("useSupervisorAnalysis: Fetching existing analysis data");
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

      // STEP 2: Fetch eligible supervisors with actual responses for this campaign/instance
      console.log("useSupervisorAnalysis: Fetching eligible supervisors with responses for campaign/instance");
      const { data: eligibleSupervisors, error: supervisorError } = await supabase
        .rpc('get_supervisors_with_min_reportees', { 
          min_reportees: 4,
          p_campaign_id: campaignId,
          p_instance_id: instanceId
        });

      if (supervisorError) {
        console.error("useSupervisorAnalysis: Error fetching eligible supervisors:", supervisorError);
        throw supervisorError;
      }

      console.log("useSupervisorAnalysis: Eligible supervisors with responses:", eligibleSupervisors?.length || 0, eligibleSupervisors);

      // STEP 3: Create union of all supervisor IDs (from both analysis and RPC)
      const analysisSupIds = new Set(analysisData?.map(a => a.supervisor_id) || []);
      const rpcSupIds = new Set(eligibleSupervisors?.map(s => s.supervisor_id) || []);
      const allSupervisorIds = Array.from(new Set([...analysisSupIds, ...rpcSupIds]));
      
      console.log("useSupervisorAnalysis: All unique supervisor IDs:", allSupervisorIds.length, allSupervisorIds);
      console.log("useSupervisorAnalysis: Analysis supervisor IDs:", analysisSupIds.size);
      console.log("useSupervisorAnalysis: RPC supervisor IDs:", rpcSupIds.size);

      if (allSupervisorIds.length === 0) {
        console.log("useSupervisorAnalysis: No supervisors found");
        return { supervisors: [], stats: { total_eligible: 0, with_analysis: 0, pending_analysis: 0 } };
      }

      // STEP 4: Fetch profiles for all supervisor IDs
      console.log("useSupervisorAnalysis: Fetching supervisor profiles for all IDs:", allSupervisorIds);
      const { data: supervisorProfiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", allSupervisorIds);

      if (profileError) {
        console.error("useSupervisorAnalysis: Error fetching supervisor profiles:", profileError);
        throw profileError;
      }

      console.log("useSupervisorAnalysis: Supervisor profiles found:", supervisorProfiles?.length || 0, supervisorProfiles);

      // STEP 5: Create lookup maps
      const analysisMap = new Map();
      if (analysisData) {
        analysisData.forEach((item: any) => {
          analysisMap.set(item.supervisor_id, item);
        });
      }

      const rpcMap = new Map();
      if (eligibleSupervisors) {
        eligibleSupervisors.forEach((item: any) => {
          rpcMap.set(item.supervisor_id, item);
        });
      }

      const profilesMap = new Map();
      if (supervisorProfiles) {
        supervisorProfiles.forEach((profile: any) => {
          profilesMap.set(profile.id, profile);
        });
      }

      console.log("useSupervisorAnalysis: Lookup maps created - Analysis:", analysisMap.size, "RPC:", rpcMap.size, "Profiles:", profilesMap.size);

      // STEP 6: Combine all supervisors with their data
      const combinedSupervisors: SupervisorAnalysisData[] = allSupervisorIds.map(supervisorId => {
        const profile = profilesMap.get(supervisorId);
        const analysis = analysisMap.get(supervisorId);
        const rpcData = rpcMap.get(supervisorId);
        
        console.log("useSupervisorAnalysis: Processing supervisor:", supervisorId, {
          hasProfile: !!profile,
          hasAnalysis: !!analysis,
          hasRpcData: !!rpcData,
          profileData: profile,
          analysisData: analysis,
          rpcData: rpcData
        });

        const supervisorName = profile 
          ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown Supervisor'
          : 'Unknown Supervisor';

        if (analysis) {
          // Supervisor has analysis data - use it
          console.log("useSupervisorAnalysis: Supervisor has analysis:", supervisorId);
          return {
            supervisor_id: supervisorId,
            supervisor_name: supervisorName,
            team_size: analysis.team_size,
            response_rate: analysis.response_rate,
            analysis_content: analysis.analysis_content,
            generated_at: analysis.generated_at,
            has_analysis: true,
            status: 'generated' as const
          };
        } else {
          // Supervisor doesn't have analysis yet - use RPC data or defaults
          console.log("useSupervisorAnalysis: Supervisor missing analysis:", supervisorId);
          const teamSize = rpcData ? rpcData.reportee_count : 0;
          return {
            supervisor_id: supervisorId,
            supervisor_name: supervisorName,
            team_size: teamSize,
            response_rate: 0,
            analysis_content: 'Analysis pending. Click "Generate AI Feedback" to create supervisor analysis for this team.',
            generated_at: new Date().toISOString(),
            has_analysis: false,
            status: 'pending' as const
          };
        }
      });

      // STEP 7: Calculate accurate statistics
      const stats: SupervisorAnalysisStats = {
        total_eligible: allSupervisorIds.length,
        with_analysis: analysisData?.length || 0,
        pending_analysis: allSupervisorIds.length - (analysisData?.length || 0)
      };

      console.log("useSupervisorAnalysis: Final result:", {
        totalSupervisors: combinedSupervisors.length,
        supervisorsWithAnalysis: combinedSupervisors.filter(s => s.has_analysis).length,
        supervisorsPending: combinedSupervisors.filter(s => !s.has_analysis).length,
        stats,
        sampleSupervisors: combinedSupervisors.slice(0, 3)
      });

      return { supervisors: combinedSupervisors, stats };
    },
    enabled: !!campaignId && !!instanceId,
  });
}
