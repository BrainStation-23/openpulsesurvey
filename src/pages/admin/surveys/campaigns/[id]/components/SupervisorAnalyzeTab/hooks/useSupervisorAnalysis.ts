
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

      // First, get all supervisors with at least 4 reportees
      console.log("useSupervisorAnalysis: Fetching eligible supervisors");
      const { data: eligibleSupervisors, error: supervisorError } = await supabase
        .rpc('get_supervisors_with_min_reportees', { min_reportees: 4 });

      if (supervisorError) {
        console.error("useSupervisorAnalysis: Error fetching eligible supervisors:", supervisorError);
        throw supervisorError;
      }

      console.log("useSupervisorAnalysis: Eligible supervisors found:", eligibleSupervisors?.length || 0, eligibleSupervisors);

      if (!eligibleSupervisors || eligibleSupervisors.length === 0) {
        console.log("useSupervisorAnalysis: No eligible supervisors found");
        return { supervisors: [], stats: { total_eligible: 0, with_analysis: 0, pending_analysis: 0 } };
      }

      const supervisorIds = eligibleSupervisors.map(s => s.supervisor_id);
      console.log("useSupervisorAnalysis: Supervisor IDs:", supervisorIds);

      // Fetch existing analysis data for these supervisors for this specific campaign and instance
      console.log("useSupervisorAnalysis: Fetching analysis data for campaign:", campaignId, "instance:", instanceId);
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
        .in("supervisor_id", supervisorIds)
        .order("generated_at", { ascending: false });

      if (analysisError) {
        console.error("useSupervisorAnalysis: Error fetching analysis data:", analysisError);
        throw analysisError;
      }

      console.log("useSupervisorAnalysis: Analysis data found:", analysisData?.length || 0, analysisData);

      // Fetch profiles for all eligible supervisors to get their names
      console.log("useSupervisorAnalysis: Fetching supervisor profiles for IDs:", supervisorIds);
      const { data: supervisorProfiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", supervisorIds);

      if (profileError) {
        console.error("useSupervisorAnalysis: Error fetching supervisor profiles:", profileError);
        throw profileError;
      }

      console.log("useSupervisorAnalysis: Supervisor profiles found:", supervisorProfiles?.length || 0, supervisorProfiles);

      // Create a map of analysis data by supervisor_id
      const analysisMap = new Map();
      if (analysisData) {
        analysisData.forEach((item: any) => {
          console.log("useSupervisorAnalysis: Mapping analysis for supervisor:", item.supervisor_id);
          analysisMap.set(item.supervisor_id, item);
        });
      }

      console.log("useSupervisorAnalysis: Analysis map size:", analysisMap.size);

      // Create a map of profiles by supervisor_id
      const profilesMap = new Map();
      if (supervisorProfiles) {
        supervisorProfiles.forEach((profile: any) => {
          profilesMap.set(profile.id, profile);
        });
      }

      console.log("useSupervisorAnalysis: Profiles map size:", profilesMap.size);

      // Combine all eligible supervisors with their analysis data (if available)
      const combinedSupervisors: SupervisorAnalysisData[] = eligibleSupervisors.map(eligible => {
        const profile = profilesMap.get(eligible.supervisor_id);
        const analysis = analysisMap.get(eligible.supervisor_id);
        
        console.log("useSupervisorAnalysis: Processing supervisor:", eligible.supervisor_id, {
          hasProfile: !!profile,
          hasAnalysis: !!analysis,
          profileData: profile,
          analysisData: analysis
        });

        const supervisorName = profile 
          ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown Supervisor'
          : 'Unknown Supervisor';

        if (analysis) {
          // Has analysis data
          console.log("useSupervisorAnalysis: Supervisor has analysis:", eligible.supervisor_id);
          return {
            supervisor_id: eligible.supervisor_id,
            supervisor_name: supervisorName,
            team_size: analysis.team_size,
            response_rate: analysis.response_rate, // Database already stores percentage
            analysis_content: analysis.analysis_content,
            generated_at: analysis.generated_at,
            has_analysis: true,
            status: 'generated' as const
          };
        } else {
          // No analysis data yet
          console.log("useSupervisorAnalysis: Supervisor missing analysis:", eligible.supervisor_id);
          return {
            supervisor_id: eligible.supervisor_id,
            supervisor_name: supervisorName,
            team_size: eligible.reportee_count,
            response_rate: 0,
            analysis_content: 'Analysis pending. Click "Generate AI Feedback" to create supervisor analysis for this team.',
            generated_at: new Date().toISOString(),
            has_analysis: false,
            status: 'pending' as const
          };
        }
      });

      // Calculate statistics
      const stats: SupervisorAnalysisStats = {
        total_eligible: eligibleSupervisors.length,
        with_analysis: analysisData?.length || 0,
        pending_analysis: eligibleSupervisors.length - (analysisData?.length || 0)
      };

      console.log("useSupervisorAnalysis: Final result:", {
        supervisors: combinedSupervisors.length,
        supervisorsData: combinedSupervisors,
        stats
      });

      return { supervisors: combinedSupervisors, stats };
    },
    enabled: !!campaignId && !!instanceId,
  });
}
