
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DemographicBreakdownItem, CampaignInstance, DemographicDistribution, AgeGroupBreakdownItem, TenureBreakdownItem } from "../types";
import { differenceInYears, parseISO } from "date-fns";

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
  
  // Calculate age groups from date of birth
  const processAgeGroups = (data: any[]): AgeGroupBreakdownItem[] => {
    const ageGroups: Record<string, number> = {
      'Under 25': 0,
      '25-34': 0,
      '35-44': 0,
      '45-54': 0,
      '55+': 0,
      'Not Specified': 0
    };
    
    data.forEach(item => {
      const dob = item.respondent.date_of_birth;
      if (!dob) {
        ageGroups['Not Specified']++;
        return;
      }
      
      try {
        const age = differenceInYears(new Date(), parseISO(dob));
        if (age < 25) ageGroups['Under 25']++;
        else if (age < 35) ageGroups['25-34']++;
        else if (age < 45) ageGroups['35-44']++;
        else if (age < 55) ageGroups['45-54']++;
        else ageGroups['55+']++;
      } catch {
        ageGroups['Not Specified']++;
      }
    });
    
    const total = Object.values(ageGroups).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(ageGroups)
      .filter(([_, count]) => count > 0) // Only include non-zero categories
      .map(([ageGroup, count]) => ({
        ageGroup,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }));
  };
  
  // Calculate tenure groups
  const processTenureGroups = (data: any[]): TenureBreakdownItem[] => {
    const tenureGroups: Record<string, number> = {
      'Less than 1 year': 0,
      '1-2 years': 0,
      '3-5 years': 0,
      '6-10 years': 0,
      'Over 10 years': 0,
      'Not Available': 0
    };
    
    // This would require join with additional employee data that has join date
    // For now, using placeholder data - in a real implementation, this would use actual hire date
    
    const total = Object.values(tenureGroups).reduce((sum, count) => sum + count, 0) || 1;
    
    return Object.entries(tenureGroups).map(([tenureGroup, count]) => ({
      tenureGroup,
      count,
      percentage: (count / total) * 100
    }));
  };

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
      
      // Process SBU/department data correctly
      const departmentCounts: Record<string, number> = {};
      data.forEach(response => {
        const userSbus = response.respondent?.user_sbus || [];
        
        if (userSbus.length === 0) {
          departmentCounts['Not Specified'] = (departmentCounts['Not Specified'] || 0) + 1;
          return;
        }
        
        // Try to find primary SBU first
        const primarySbu = userSbus.find(s => s.is_primary && s.sbu);
        
        if (primarySbu) {
          const deptName = primarySbu.sbu.name;
          departmentCounts[deptName] = (departmentCounts[deptName] || 0) + 1;
        } else if (userSbus[0]?.sbu) {
          // Fall back to first SBU if no primary
          const deptName = userSbus[0].sbu.name;
          departmentCounts[deptName] = (departmentCounts[deptName] || 0) + 1;
        } else {
          departmentCounts['Not Specified'] = (departmentCounts['Not Specified'] || 0) + 1;
        }
      });
      
      const totalDepts = Object.values(departmentCounts).reduce((sum, count) => sum + count, 0);
      
      const departments = Object.entries(departmentCounts).map(([name, count]) => ({
        name,
        count,
        percentage: totalDepts > 0 ? (count / totalDepts) * 100 : 0
      })).sort((a, b) => b.count - a.count);
      
      // Extract gender data
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
      
      // Prepare full dataset
      return {
        departments,
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
