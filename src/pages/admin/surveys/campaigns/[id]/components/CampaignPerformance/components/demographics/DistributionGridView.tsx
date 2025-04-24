
import React from 'react';
import { DemographicCard } from './DemographicCard';
import type { DemographicDistribution } from '../../types';

interface DistributionGridViewProps {
  demographicData: DemographicDistribution;
  chartType: "pie" | "bar";
}

export function DistributionGridView({ demographicData, chartType }: DistributionGridViewProps) {
  const {
    departments,
    locations,
    employeeTypes,
    employmentTypes,
    genders,
    levels,
    ageGroups,
    tenureGroups
  } = demographicData;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
      {departments?.length > 0 && (
        <div className="h-[400px]">
          <DemographicCard 
            title="Department Distribution"
            data={departments}
            chartType={chartType}
          />
        </div>
      )}

      {locations?.length > 0 && (
        <div className="h-[400px]">
          <DemographicCard 
            title="Location Distribution"
            data={locations}
            chartType={chartType}
          />
        </div>
      )}

      {genders?.length > 0 && (
        <div className="h-[400px]">
          <DemographicCard 
            title="Gender Distribution"
            data={genders}
            chartType={chartType}
          />
        </div>
      )}

      {levels?.length > 0 && (
        <div className="h-[400px]">
          <DemographicCard 
            title="Level Distribution"
            data={levels}
            chartType={chartType}
          />
        </div>
      )}

      {employeeTypes?.length > 0 && (
        <div className="h-[400px]">
          <DemographicCard 
            title="Employee Type Distribution"
            data={employeeTypes}
            chartType={chartType}
          />
        </div>
      )}

      {employmentTypes?.length > 0 && (
        <div className="h-[400px]">
          <DemographicCard 
            title="Employment Type Distribution"
            data={employmentTypes}
            chartType={chartType}
          />
        </div>
      )}

      {ageGroups?.length > 0 && (
        <div className="h-[400px]">
          <DemographicCard 
            title="Age Group Distribution"
            data={ageGroups}
            chartType={chartType}
            nameKey="ageGroup"
          />
        </div>
      )}

      {tenureGroups?.length > 0 && (
        <div className="h-[400px]">
          <DemographicCard 
            title="Tenure Distribution"
            data={tenureGroups}
            chartType={chartType}
            nameKey="tenureGroup"
          />
        </div>
      )}
    </div>
  );
}
