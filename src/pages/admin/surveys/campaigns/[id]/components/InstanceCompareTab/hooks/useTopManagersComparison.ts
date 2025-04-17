
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TopManagerPerformer {
  name: string;
  base_score: number;
  comparison_score: number;
  change: number;
  base_rank: number;
  comparison_rank: number;
  rank_change: number;
}

export function useTopManagersComparison(baseInstanceId?: string, comparisonInstanceId?: string) {
  return useQuery({
    queryKey: ["top-managers-comparison", baseInstanceId, comparisonInstanceId],
    queryFn: async (): Promise<TopManagerPerformer[]> => {
      if (!baseInstanceId || !comparisonInstanceId) return [];

      const [baseResult, comparisonResult] = await Promise.all([
        supabase
          .from("top_performing_managers")
          .select("*")
          .eq("instance_id", baseInstanceId),
        supabase
          .from("top_performing_managers")
          .select("*")
          .eq("instance_id", comparisonInstanceId)
      ]);

      if (baseResult.error) throw baseResult.error;
      if (comparisonResult.error) throw comparisonResult.error;

      // Map to store combined manager data
      const managerMap = new Map<string, TopManagerPerformer>();
      
      // Process base instance data
      baseResult.data.forEach(manager => {
        managerMap.set(manager.manager_id, {
          name: manager.manager_name,
          base_score: manager.average_score || 0,
          comparison_score: 0,
          change: 0,
          base_rank: manager.rank,
          comparison_rank: 999, // Default high value for managers not in comparison data
          rank_change: 0
        });
      });
      
      // Process comparison instance data and update the map
      comparisonResult.data.forEach(manager => {
        if (managerMap.has(manager.manager_id)) {
          // Update existing manager data
          const existingManager = managerMap.get(manager.manager_id)!;
          existingManager.comparison_score = manager.average_score || 0;
          existingManager.change = existingManager.base_score - existingManager.comparison_score;
          existingManager.comparison_rank = manager.rank;
          existingManager.rank_change = existingManager.comparison_rank - existingManager.base_rank;
        } else {
          // Add new manager that was only in comparison data
          managerMap.set(manager.manager_id, {
            name: manager.manager_name,
            base_score: 0,
            comparison_score: manager.average_score || 0,
            change: -(manager.average_score || 0),
            base_rank: 999, // Default high value for managers not in base data
            comparison_rank: manager.rank,
            rank_change: -999 // Will be filtered in UI if needed
          });
        }
      });

      return Array.from(managerMap.values())
        .filter(manager => manager.base_rank <= 10 || manager.comparison_rank <= 10); // Only include top 10 from either period
    },
    enabled: !!baseInstanceId && !!comparisonInstanceId,
  });
}
