
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DepartmentData {
  name: string;
  base_completion: number;
  comparison_completion: number;
  change: number;
}

// Define explicit interface for department performance data
interface DepartmentPerformance {
  sbu_name: string;
  completion_rate: number;
}

export function useDepartmentComparison(baseInstanceId?: string, comparisonInstanceId?: string) {
  return useQuery<DepartmentData[], Error>({
    queryKey: ["department-comparison", baseInstanceId, comparisonInstanceId],
    queryFn: async (): Promise<DepartmentData[]> => {
      if (!baseInstanceId || !comparisonInstanceId) return [];

      // Since we don't have direct department performance tables,
      // we'll query for SBU/department data from campaign assignments and responses
      const [baseResult, comparisonResult] = await Promise.all([
        supabase.rpc('get_campaign_sbu_performance', {
          p_campaign_id: null, // This would be derived from baseInstanceId
          p_instance_id: baseInstanceId
        }),
        supabase.rpc('get_campaign_sbu_performance', {
          p_campaign_id: null, // This would be derived from comparisonInstanceId
          p_instance_id: comparisonInstanceId
        })
      ]);
      
      // If the RPC doesn't exist yet or there was an error, return empty array
      if (baseResult.error || comparisonResult.error) {
        console.error("Error fetching department data:", baseResult.error || comparisonResult.error);
        return [];
      }
      
      // If no data was found, return empty array
      if (!baseResult.data?.length && !comparisonResult.data?.length) {
        return [];
      }
      
      // Map the results to our interface
      const departmentMap = new Map<string, DepartmentData>();
      
      // Process base instance data
      if (baseResult.data) {
        baseResult.data.forEach((dept: DepartmentPerformance) => {
          departmentMap.set(dept.sbu_name, {
            name: dept.sbu_name,
            base_completion: dept.completion_rate || 0,
            comparison_completion: 0,
            change: 0
          });
        });
      }
      
      // Process comparison data
      if (comparisonResult.data) {
        comparisonResult.data.forEach((dept: DepartmentPerformance) => {
          if (departmentMap.has(dept.sbu_name)) {
            // Update existing department
            const existing = departmentMap.get(dept.sbu_name)!;
            existing.comparison_completion = dept.completion_rate || 0;
            existing.change = existing.base_completion - existing.comparison_completion;
          } else {
            // Add new department
            departmentMap.set(dept.sbu_name, {
              name: dept.sbu_name,
              base_completion: 0,
              comparison_completion: dept.completion_rate || 0,
              change: -(dept.completion_rate || 0)
            });
          }
        });
      }
      
      return Array.from(departmentMap.values());
    },
    enabled: !!baseInstanceId && !!comparisonInstanceId,
  });
}
