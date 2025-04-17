
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

export function useTopManagersComparison(campaignId?: string, baseInstanceId?: string, comparisonInstanceId?: string) {
  return useQuery({
    queryKey: ["top-managers-comparison", campaignId, baseInstanceId, comparisonInstanceId],
    queryFn: async (): Promise<TopManagerPerformer[]> => {
      if (!campaignId || !baseInstanceId || !comparisonInstanceId) return [];

      try {
        // We'll use the existing RPC function if available
        const [baseResult, comparisonResult] = await Promise.all([
          supabase.rpc('get_campaign_supervisor_performance', {
            p_campaign_id: campaignId,
            p_instance_id: baseInstanceId
          }),
          supabase.rpc('get_campaign_supervisor_performance', {
            p_campaign_id: campaignId,
            p_instance_id: comparisonInstanceId
          })
        ]);
        
        if (baseResult.error || comparisonResult.error) {
          console.error("Error fetching manager data:", baseResult.error || comparisonResult.error);
          throw new Error("Failed to fetch manager data");
        }
        
        // Build map of managers
        const managerMap = new Map<string, TopManagerPerformer>();
        
        // Process base instance data
        baseResult.data.forEach((manager: any) => {
          managerMap.set(manager.supervisor_name, {
            name: manager.supervisor_name,
            base_score: manager.avg_score || 0,
            comparison_score: 0,
            change: 0,
            base_rank: manager.rank || 999,
            comparison_rank: 999,
            rank_change: 0
          });
        });
        
        // Process comparison data
        comparisonResult.data.forEach((manager: any) => {
          if (managerMap.has(manager.supervisor_name)) {
            // Update existing manager
            const existing = managerMap.get(manager.supervisor_name)!;
            existing.comparison_score = manager.avg_score || 0;
            existing.change = existing.comparison_score - existing.base_score;
            existing.comparison_rank = manager.rank || 999;
            existing.rank_change = existing.base_rank - existing.comparison_rank;
          } else {
            // Add new manager
            managerMap.set(manager.supervisor_name, {
              name: manager.supervisor_name,
              base_score: 0,
              comparison_score: manager.avg_score || 0,
              change: manager.avg_score || 0,
              base_rank: 999,
              comparison_rank: manager.rank || 999,
              rank_change: 999 - manager.rank || 0
            });
          }
        });
        
        // Sort by base rank
        return Array.from(managerMap.values())
          .sort((a, b) => a.base_rank - b.base_rank);
      } catch (error) {
        console.error("Error fetching manager comparison data:", error);
        return []; // Return empty array instead of mock data
      }
    },
    enabled: !!campaignId && !!baseInstanceId && !!comparisonInstanceId,
  });
}
