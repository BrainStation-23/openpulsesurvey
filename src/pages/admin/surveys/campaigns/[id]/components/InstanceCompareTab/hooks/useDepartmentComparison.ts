
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DepartmentComparisonItem {
  sbu_name: string;
  base_completion_rate: number;
  comparison_completion_rate: number;
  change: number;
}

export function useDepartmentComparison(baseInstanceId?: string, comparisonInstanceId?: string) {
  return useQuery({
    queryKey: ["department-comparison", baseInstanceId, comparisonInstanceId],
    queryFn: async (): Promise<DepartmentComparisonItem[]> => {
      if (!baseInstanceId || !comparisonInstanceId) return [];

      const [baseResult, comparisonResult] = await Promise.all([
        supabase
          .from("department_performance")
          .select("sbu_name, completion_rate")
          .eq("instance_id", baseInstanceId),
        supabase
          .from("department_performance")
          .select("sbu_name, completion_rate")
          .eq("instance_id", comparisonInstanceId)
      ]);

      if (baseResult.error) throw baseResult.error;
      if (comparisonResult.error) throw comparisonResult.error;

      // Build a unified map of all departments
      const departmentMap = new Map<string, DepartmentComparisonItem>();
      
      // Add all departments from base instance
      baseResult.data.forEach(item => {
        departmentMap.set(item.sbu_name, {
          sbu_name: item.sbu_name,
          base_completion_rate: item.completion_rate || 0,
          comparison_completion_rate: 0,
          change: 0
        });
      });
      
      // Process comparison instance departments
      comparisonResult.data.forEach(item => {
        if (departmentMap.has(item.sbu_name)) {
          // Update existing department
          const existing = departmentMap.get(item.sbu_name)!;
          existing.comparison_completion_rate = item.completion_rate || 0;
          existing.change = existing.base_completion_rate - existing.comparison_completion_rate;
        } else {
          // Add new department that was only in comparison instance
          departmentMap.set(item.sbu_name, {
            sbu_name: item.sbu_name,
            base_completion_rate: 0,
            comparison_completion_rate: item.completion_rate || 0,
            change: -(item.completion_rate || 0)
          });
        }
      });
      
      return Array.from(departmentMap.values());
    },
    enabled: !!baseInstanceId && !!comparisonInstanceId,
  });
}
