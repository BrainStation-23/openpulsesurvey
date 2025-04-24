
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DemographicBreakdownItem, CampaignInstance } from "../types";

export function useCampaignDemographics(campaignId: string, instances: CampaignInstance[]) {
  // Helper function to process demographic data
  const processDemographicData = (data: any[], property: string): DemographicBreakdownItem[] => {
    const counts: Record<string, number> = {};
    
    // Count occurrences of each demographic value
    data.forEach(item => {
      const value = item[property]?.name || 'Not Specified';
      counts[value] = (counts[value] || 0) + 1;
    });
    
    // Calculate percentages
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    })).sort((a, b) => b.count - a.count);
  };

  const { data: demographicData, isLoading } = useQuery({
    queryKey: ["campaign-demographics", campaignId],
    queryFn: async () => {
      // Get instance IDs for this campaign
      const instanceIds = instances.map(instance => instance.id);
      
      if (instanceIds.length === 0) {
        return {
          departments: [],
          locations: [],
          employeeTypes: [],
          employmentTypes: []
        };
      }
      
      // Fetch respondent demographic data for all responses
      const { data, error } = await supabase
        .from("survey_responses")
        .select(`
          id,
          respondent:profiles(
            id,
            sbu:sbus(id, name),
            location:locations(id, name),
            employee_type:employee_types(id, name),
            employment_type:employment_types(id, name)
          )
        `)
        .in("campaign_instance_id", instanceIds);
        
      if (error) throw error;
      
      // Process each demographic dimension
      return {
        departments: processDemographicData(data.map(d => d.respondent), 'sbu'),
        locations: processDemographicData(data.map(d => d.respondent), 'location'),
        employeeTypes: processDemographicData(data.map(d => d.respondent), 'employee_type'),
        employmentTypes: processDemographicData(data.map(d => d.respondent), 'employment_type')
      };
    },
    enabled: instances && instances.length > 0
  });

  return {
    demographicData,
    isLoading
  };
}
