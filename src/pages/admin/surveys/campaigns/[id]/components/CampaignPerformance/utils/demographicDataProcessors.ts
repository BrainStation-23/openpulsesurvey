
import { DemographicBreakdownItem, AgeGroupBreakdownItem, TenureBreakdownItem } from "../types";
import { differenceInYears, parseISO } from "date-fns";

export const processDemographicData = (data: any[], property: string): DemographicBreakdownItem[] => {
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

export const processAgeGroups = (data: any[]): AgeGroupBreakdownItem[] => {
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
    .filter(([_, count]) => count > 0)
    .map(([ageGroup, count]) => ({
      ageGroup,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }));
};

export const processTenureGroups = (data: any[]): TenureBreakdownItem[] => {
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
