
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DemographicDistribution, CampaignInstance } from "../types";
import { processDemographicData, processAgeGroups, processTenureGroups } from "../utils/demographicDataProcessors";
import { processDepartmentData } from "../utils/departmentProcessor";

export function useCampaignDemographics(campaignId: string, instances: CampaignInstance[]) {
  const { data: demographicData, isLoading } = useQuery({
    queryKey: ["campaign-demographics", campaignId, instances.map(i => i.id).join()],
    queryFn: async () => {
      // Get instance IDs for this campaign
      const instanceIds = instances.map(instance => instance.id);
      
      if (instanceIds.length === 0) {
        return {
          departments: [],
          locations: [],
          employeeTypes: [],
          employmentTypes: [],
          genders: [],
          levels: [],
          ageGroups: [],
          tenureGroups: []
        } as DemographicDistribution;
      }
      
      // Fetch respondent demographic data for all responses
      const { data, error } = await supabase
        .from("survey_responses")
        .select(`
          id,
          respondent:profiles(
            id,
            first_name,
            last_name,
            gender,
            date_of_birth,
            location:locations(id, name),
            employee_type:employee_types(id, name),
            employment_type:employment_types(id, name),
            level:levels(id, name),
            user_sbus(
              is_primary,
              sbu:sbus(id, name)
            )
          )
        `)
        .in("campaign_instance_id", instanceIds);
        
      if (error) throw error;

      // Process gender data
      const genderCounts: Record<string, number> = {};
      data.forEach(response => {
        const gender = response.respondent?.gender || 'Not Specified';
        genderCounts[gender] = (genderCounts[gender] || 0) + 1;
      });
      
      const totalGenders = Object.values(genderCounts).reduce((sum, count) => sum + count, 0);
      
      const genders = Object.entries(genderCounts).map(([name, count]) => ({
        name,
        count,
        percentage: totalGenders > 0 ? (count / totalGenders) * 100 : 0
      })).sort((a, b) => b.count - a.count);
      
      // Prepare full dataset using utility functions
      return {
        departments: processDepartmentData(data),
        locations: processDemographicData(data.map(d => d.respondent), 'location'),
        employeeTypes: processDemographicData(data.map(d => d.respondent), 'employee_type'),
        employmentTypes: processDemographicData(data.map(d => d.respondent), 'employment_type'),
        genders,
        levels: processDemographicData(data.map(d => d.respondent), 'level'),
        ageGroups: processAgeGroups(data),
        tenureGroups: processTenureGroups(data)
      } as DemographicDistribution;
    },
    enabled: instances && instances.length > 0
  });

  return {
    demographicData,
    isLoading
  };
}
