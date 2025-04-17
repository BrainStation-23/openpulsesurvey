
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TopSBUPerformer {
  name: string;
  base_score: number;
  comparison_score: number;
  change: number;
  base_rank: number;
  comparison_rank: number;
  rank_change: number;
}

// Define explicit interface for RPC function results
interface SBUPerformanceResult {
  rank: number;
  sbu_name: string;
  total_assigned: number;
  total_completed: number;
  avg_score: number;
  completion_rate: number;
}

export function useTopSBUComparison(
  campaignId?: string,
  baseInstanceId?: string, 
  comparisonInstanceId?: string
) {
  return useQuery({
    queryKey: ["top-sbu-comparison", campaignId, baseInstanceId, comparisonInstanceId],
    queryFn: async () => {
      if (!campaignId || !baseInstanceId || !comparisonInstanceId) {
        return [] as TopSBUPerformer[];
      }

      try {
        // Get base instance data using RPC function
        const { data: baseResults, error: baseError } = await supabase
          .rpc('get_campaign_sbu_performance', {
            p_campaign_id: campaignId,
            p_instance_id: baseInstanceId
          });
          
        // Get comparison instance data using RPC function
        const { data: comparisonResults, error: comparisonError } = await supabase
          .rpc('get_campaign_sbu_performance', {
            p_campaign_id: campaignId,
            p_instance_id: comparisonInstanceId
          });

        if (baseError) throw new Error(`Failed to fetch base SBU data: ${baseError.message}`);
        if (comparisonError) throw new Error(`Failed to fetch comparison SBU data: ${comparisonError.message}`);
        
        // Early return if no data
        if (!baseResults?.length && !comparisonResults?.length) {
          return [] as TopSBUPerformer[];
        }

        // Map and merge the results
        const sbuMap = new Map<string, TopSBUPerformer>();
        
        // Process base instance data
        if (baseResults) {
          baseResults.forEach((sbu: SBUPerformanceResult) => {
            sbuMap.set(sbu.sbu_name, {
              name: sbu.sbu_name,
              base_score: Number(sbu.avg_score) || 0,
              comparison_score: 0,
              change: 0,
              base_rank: sbu.rank || 999,
              comparison_rank: 999,
              rank_change: 0
            });
          });
        }
        
        // Process comparison data
        if (comparisonResults) {
          comparisonResults.forEach((sbu: SBUPerformanceResult) => {
            if (sbuMap.has(sbu.sbu_name)) {
              // Update existing SBU
              const existing = sbuMap.get(sbu.sbu_name)!;
              existing.comparison_score = Number(sbu.avg_score) || 0;
              existing.change = existing.base_score - existing.comparison_score;
              existing.comparison_rank = sbu.rank || 999;
              existing.rank_change = existing.base_rank - existing.comparison_rank;
            } else {
              // Add new SBU
              sbuMap.set(sbu.sbu_name, {
                name: sbu.sbu_name,
                base_score: 0,
                comparison_score: Number(sbu.avg_score) || 0,
                change: -(Number(sbu.avg_score) || 0),
                base_rank: 999,
                comparison_rank: sbu.rank || 999,
                rank_change: -999
              });
            }
          });
        }
        
        return Array.from(sbuMap.values());
      } catch (error) {
        console.error("Error fetching SBU comparison data:", error);
        throw error;
      }
    },
    enabled: !!campaignId && !!baseInstanceId && !!comparisonInstanceId,
  });
}
