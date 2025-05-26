
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
      if (!campaignId || !instanceId) {
        return [];
      }

      // Fetch analysis data directly and join with profiles
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
        .order("generated_at", { ascending: false });

      if (analysisError) {
        console.error("Error fetching supervisor analysis:", analysisError);
        throw analysisError;
      }

      if (!analysisData || analysisData.length === 0) {
        return [];
      }

      return analysisData.map((item: any) => ({
        supervisor_id: item.supervisor_id,
        supervisor_name: `${item.profiles?.first_name || ''} ${item.profiles?.last_name || ''}`.trim() || 'Unknown Supervisor',
        team_size: item.team_size,
        response_rate: item.response_rate,
        analysis_content: item.analysis_content,
        generated_at: item.generated_at
      }));
    },
    enabled: !!campaignId && !!instanceId,
  });
}
