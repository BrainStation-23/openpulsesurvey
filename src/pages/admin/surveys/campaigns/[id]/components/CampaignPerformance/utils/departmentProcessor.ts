
import { DemographicBreakdownItem } from "../types";

export const processDepartmentData = (data: any[]): DemographicBreakdownItem[] => {
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
  
  return Object.entries(departmentCounts).map(([name, count]) => ({
    name,
    count,
    percentage: totalDepts > 0 ? (count / totalDepts) * 100 : 0
  })).sort((a, b) => b.count - a.count);
};
