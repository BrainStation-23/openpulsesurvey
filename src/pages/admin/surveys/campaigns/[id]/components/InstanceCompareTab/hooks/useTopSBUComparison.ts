
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

export function useTopSBUComparison(baseInstanceId?: string, comparisonInstanceId?: string) {
  return useQuery<TopSBUPerformer[], Error>({
    queryKey: ["top-sbu-comparison", baseInstanceId, comparisonInstanceId],
    queryFn: async () => {
      if (!baseInstanceId || !comparisonInstanceId) return [];

      // Try to fetch real data from top_performing_sbus if available
      const { data: baseResults, error: baseError } = await supabase
        .from("top_performing_sbus")
        .select("*")
        .eq("instance_id", baseInstanceId);
        
      const { data: comparisonResults, error: comparisonError } = await supabase
        .from("top_performing_sbus")
        .select("*")
        .eq("instance_id", comparisonInstanceId);

      if (baseError) throw new Error(`Failed to fetch base SBU data: ${baseError.message}`);
      if (comparisonError) throw new Error(`Failed to fetch comparison SBU data: ${comparisonError.message}`);
      
      if (!baseResults?.length && !comparisonResults?.length) {
        // Return empty array when no data is found
        return [];
      }

      // Map the results to our interface
      const sbuMap = new Map<string, TopSBUPerformer>();
      
      // Process base instance data
      if (baseResults) {
        baseResults.forEach((sbu: any) => {
          sbuMap.set(sbu.sbu_name, {
            name: sbu.sbu_name,
            base_score: sbu.average_score || 0,
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
        comparisonResults.forEach((sbu: any) => {
          if (sbuMap.has(sbu.sbu_name)) {
            // Update existing SBU
            const existing = sbuMap.get(sbu.sbu_name)!;
            existing.comparison_score = sbu.average_score || 0;
            existing.change = existing.base_score - existing.comparison_score;
            existing.comparison_rank = sbu.rank || 999;
            existing.rank_change = existing.comparison_rank - existing.base_rank;
          } else {
            // Add new SBU
            sbuMap.set(sbu.sbu_name, {
              name: sbu.sbu_name,
              base_score: 0,
              comparison_score: sbu.average_score || 0,
              change: -(sbu.average_score || 0),
              base_rank: 999,
              comparison_rank: sbu.rank || 999,
              rank_change: -999
            });
          }
        });
      }
      
      return Array.from(sbuMap.values());
    },
    enabled: !!baseInstanceId && !!comparisonInstanceId,
  });
}
