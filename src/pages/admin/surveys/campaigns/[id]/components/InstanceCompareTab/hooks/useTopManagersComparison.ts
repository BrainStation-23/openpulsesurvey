
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SupervisorPerformer } from "../types/instance-comparison";

export function useTopManagersComparison(campaignId?: string, baseInstanceId?: string, comparisonInstanceId?: string) {
  return useQuery({
    queryKey: ["top-managers-comparison", campaignId, baseInstanceId, comparisonInstanceId],
    queryFn: async (): Promise<SupervisorPerformer[]> => {
      if (!campaignId || !baseInstanceId || !comparisonInstanceId) {
        console.log("Missing required parameters for supervisor comparison", { campaignId, baseInstanceId, comparisonInstanceId });
        return [];
      }

      try {
        console.log("Fetching supervisor performance data for:", { 
          campaignId, 
          baseInstanceId, 
          comparisonInstanceId 
        });
        
        // We'll use the existing RPC function if available
        const [baseResult, comparisonResult] = await Promise.all([
          supabase.rpc('get_supervisor_satisfaction', {
            p_campaign_id: campaignId,
            p_instance_id: baseInstanceId,
            p_question_name: 'overallSatisfaction' // Default question for manager performance
          }),
          supabase.rpc('get_supervisor_satisfaction', {
            p_campaign_id: campaignId,
            p_instance_id: comparisonInstanceId,
            p_question_name: 'overallSatisfaction' // Default question for manager performance
          })
        ]);
        
        if (baseResult.error || comparisonResult.error) {
          console.error("Error fetching manager data:", baseResult.error || comparisonResult.error);
          throw new Error("Failed to fetch manager data");
        }
        
        console.log("Supervisor data fetched successfully:", {
          baseData: baseResult.data,
          comparisonData: comparisonResult.data
        });
        
        // Build map of managers
        const managerMap = new Map<string, SupervisorPerformer>();
        
        // Process base instance data
        baseResult.data.forEach((manager: any) => {
          managerMap.set(manager.dimension, {
            name: manager.dimension,
            base_score: manager.avg_score || 0, // Use avg_score from RPC
            comparison_score: 0,
            change: 0,
            base_rank: manager.rank || 999,
            comparison_rank: 999,
            rank_change: 0,
            department: undefined, // We could fetch this in future if needed
            total_reports: manager.total || undefined,
            avg_score: manager.avg_score // Store avg_score from RPC
          });
        });
        
        // Process comparison data
        comparisonResult.data.forEach((manager: any) => {
          if (managerMap.has(manager.dimension)) {
            // Update existing manager
            const existing = managerMap.get(manager.dimension)!;
            existing.comparison_score = manager.avg_score || 0; // Use avg_score from RPC
            existing.change = existing.comparison_score - existing.base_score;
            existing.comparison_rank = manager.rank || 999;
            existing.rank_change = existing.base_rank - existing.comparison_rank;
            // Update avg_score to be the comparison score (most recent)
            existing.avg_score = manager.avg_score;
          } else {
            // Add new manager
            managerMap.set(manager.dimension, {
              name: manager.dimension,
              base_score: 0,
              comparison_score: manager.avg_score || 0, // Use avg_score from RPC
              change: manager.avg_score || 0,
              base_rank: 999,
              comparison_rank: manager.rank || 999,
              rank_change: 999 - (manager.rank || 0),
              department: undefined,
              total_reports: manager.total || undefined,
              avg_score: manager.avg_score // Store avg_score from RPC
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
