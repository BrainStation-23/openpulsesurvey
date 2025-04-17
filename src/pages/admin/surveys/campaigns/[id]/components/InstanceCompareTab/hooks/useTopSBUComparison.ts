
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TopSBUPerformer {
  name: string;
  base_score: number;
  comparison_score: number;
  change: number;
  base_rank: number;
  comparison_rank: number;
  rank_change: number;
}

export function useTopSBUComparison(baseInstanceId?: string, comparisonInstanceId?: string) {
  return useQuery({
    queryKey: ["top-sbu-comparison", baseInstanceId, comparisonInstanceId],
    queryFn: async (): Promise<TopSBUPerformer[]> => {
      if (!baseInstanceId || !comparisonInstanceId) return [];

      const [baseResult, comparisonResult] = await Promise.all([
        supabase
          .rpc("get_campaign_sbu_performance", {
            p_campaign_id: null, // Not needed when supplying instance_id
            p_instance_id: baseInstanceId
          }),
        supabase
          .rpc("get_campaign_sbu_performance", {
            p_campaign_id: null, // Not needed when supplying instance_id
            p_instance_id: comparisonInstanceId
          })
      ]);

      if (baseResult.error) throw baseResult.error;
      if (comparisonResult.error) throw comparisonResult.error;

      // Map to store combined SBU data
      const sbuMap = new Map<string, TopSBUPerformer>();
      
      // Process base instance data
      baseResult.data.forEach(sbu => {
        sbuMap.set(sbu.sbu_name, {
          name: sbu.sbu_name,
          base_score: sbu.avg_score || 0,
          comparison_score: 0,
          change: 0,
          base_rank: sbu.rank,
          comparison_rank: 999, // Default high value for SBUs not in comparison data
          rank_change: 0
        });
      });
      
      // Process comparison instance data and update the map
      comparisonResult.data.forEach(sbu => {
        if (sbuMap.has(sbu.sbu_name)) {
          // Update existing SBU data
          const existingSBU = sbuMap.get(sbu.sbu_name)!;
          existingSBU.comparison_score = sbu.avg_score || 0;
          existingSBU.change = existingSBU.base_score - existingSBU.comparison_score;
          existingSBU.comparison_rank = sbu.rank;
          existingSBU.rank_change = existingSBU.comparison_rank - existingSBU.base_rank;
        } else {
          // Add new SBU that was only in comparison data
          sbuMap.set(sbu.sbu_name, {
            name: sbu.sbu_name,
            base_score: 0,
            comparison_score: sbu.avg_score || 0,
            change: -(sbu.avg_score || 0),
            base_rank: 999, // Default high value for SBUs not in base data
            comparison_rank: sbu.rank,
            rank_change: -999 // Will be filtered in UI if needed
          });
        }
      });

      return Array.from(sbuMap.values())
        .filter(sbu => sbu.base_rank <= 10 || sbu.comparison_rank <= 10); // Only include top 10 from either period
    },
    enabled: !!baseInstanceId && !!comparisonInstanceId,
  });
}
